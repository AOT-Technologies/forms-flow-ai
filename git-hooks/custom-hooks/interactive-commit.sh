#!/bin/sh

# Define arrays for commit types and required fields
# Note: In sh arrays are space-separated strings
COMMIT_TYPES="Feature Bugfix Hotfix Modified Documentation"
REQUIRED_FIELDS="type description ticket"

# Function to check if a value exists in space-separated list
contains() {
    list="$1"
    value="$2"
    case " $list " in
        *" $value "*) return 0 ;;
        *) return 1 ;;
    esac
}

# Function to validate ticket number format
is_valid_ticket() {
    ticket="$1"
    echo "$ticket" | grep -qE '^FWF-[0-9]+$'
}

# Function to validate yes/no input
is_valid_yes() {
    case "$1" in
        [Yy]|[Yy][Ee][Ss]) return 0 ;;
        *) return 1 ;;
    esac
}

is_valid_no() {
    case "$1" in
        [Nn]|[Nn][Oo]) return 0 ;;
        *) return 1 ;;
    esac
}

# Function to get user confirmation
get_user_confirmation() {
    prompt="$1"
    while true; do
        printf "%s (y/n): " "$prompt" > /dev/tty
        read -r answer < /dev/tty
        if is_valid_yes "$answer"; then
            return 0
        elif is_valid_no "$answer"; then
            return 1
        else
            echo "Please answer with Yes or No"
        fi
    done
}

# Function to get user input with optional default value
get_user_input() {
    prompt="$1"
    default_value="$2"
    required="$3"
    
    while true; do
        if [ -n "$default_value" ]; then
            printf "%s [%s]: " "$prompt" "$default_value" > /dev/tty
        else
            printf "%s: " "$prompt" > /dev/tty
        fi
        
        # Use IFS= to preserve leading/trailing whitespace
        IFS= read -r answer < /dev/tty || return 1
        
        # Use default value if answer is empty and default exists
        if [ -z "$answer" ] && [ -n "$default_value" ]; then
            answer="$default_value"
        fi
        
        # Check if input is required
        if [ "$required" = "true" ] && [ -z "$answer" ]; then
            echo "❌ This field is required. Please provide a value."
            continue
        fi
        
        printf "%s\n" "$answer"
        return 0
    done
}

# Function to get bullet points for commit body
get_commit_body() {
    # Send prompts directly to the terminal
    echo "Enter bullet points for multiple changes (press Enter twice to finish):" > /dev/tty
    echo "Example:" > /dev/tty
    echo "-Added feature X" > /dev/tty
    echo "-Updated component Y" > /dev/tty
    echo "" > /dev/tty
    
    body=""
    while true; do
        printf "> " > /dev/tty
        # Read directly from the terminal
        read -r line < /dev/tty
        
        # Break on empty line
        if [ -z "$line" ]; then
            break
        fi
        
        # Ensure line starts with a hyphen
        if ! echo "$line" | grep -q "^-"; then
            line="-$line"
        fi
        
        # Append the validated line to the body
        if [ -z "$body" ]; then
            body="$line"
        else
            body="$(printf "%s\n%s" "$body" "$line")" # Use printf for newline
        fi
    done
    
    # Return the collected body
    echo "$body"
}

# Function to select commit type
select_commit_type() {
    echo "Select the type of commit:" > /dev/tty
    index=1
    for type in $COMMIT_TYPES; do
        case $type in
            Feature) desc="New features or functionalities" ;;
            Bugfix) desc="Corrections of code errors or bugs" ;;
            Hotfix) desc="Urgent fixes addressing critical issues" ;;
            Modified) desc="General modifications or updates" ;;
            Documentation) desc="Documentation/changelog changes only" ;;
            *) desc="" ;;
        esac
        echo "$index) $type     ($desc)" > /dev/tty
        index=$((index + 1))
    done
    
    while true; do
        printf "Enter number (1-%d): " "$((index-1))" > /dev/tty
        read -r choice < /dev/tty
        
        # Validate that choice is a number
        case "$choice" in
            ''|*[!0-9]*) 
                echo "Please enter a valid number between 1 and $((index-1))" > /dev/tty
                continue 
                ;;
        esac
        
        # Convert choice to number and compare
        choice_num=$((choice + 0))
        if [ "$choice_num" -ge 1 ] && [ "$choice_num" -lt "$index" ]; then
            # Get the nth type from COMMIT_TYPES
            echo "$COMMIT_TYPES" | cut -d' ' -f"$choice_num"
            break
        else
            echo "Please enter a number between 1 and $((index-1))" > /dev/tty
        fi
    done
}

# Function to validate commit message fields
validate_commit_fields() {
    type="$1"
    description="$2"
    ticket="$3"
    
    for field in $REQUIRED_FIELDS; do
        case $field in
            type)
                if [ -z "$type" ]; then
                    echo "❌ Error: Commit type is required"
                    return 1
                fi
                if ! contains "$COMMIT_TYPES" "$type"; then
                    echo "❌ Error: Invalid commit type '$type'"
                    return 1
                fi
                ;;
            description)
                if [ -z "$description" ]; then
                    echo "❌ Error: Commit description is required"
                    return 1
                fi
                ;;
            ticket)
                if [ -z "$ticket" ]; then
                    echo "❌ Error: Ticket number is required"
                    return 1
                fi
                if ! is_valid_ticket "$ticket"; then
                    echo "❌ Error: Invalid ticket format. Must be in format 'FWF-123'"
                    return 1
                fi
                ;;
        esac
    done
    return 0
}

# Function to get template path relative to the git directory
get_template_path() {
    git_dir=$(git rev-parse --git-dir)
    template_path="$git_dir/hooks/commit-template.txt"
    if [ ! -f "$template_path" ]; then
        echo >&2 "Error: Commit template file not found at $template_path"
        exit 1
    fi
    echo "$template_path"
}

# Function to apply template
apply_template() {
    ticket="$1"
    type="$2"
    description="$3"
    body="$4"
    
    template_path=$(get_template_path)
    
    # Read the template file, skipping comments and empty lines
    if [ -n "$body" ]; then
        template=$(grep -A 1 "^# Multi-line format" "$template_path" | tail -n 1)
    else
        template=$(grep -A 1 "^# Single line format" "$template_path" | tail -n 1)
    fi
    
    # Replace the placeholders
    message="$template"
    message=$(echo "$message" | sed "s/{ticket}/$ticket/g")
    message=$(echo "$message" | sed "s/{type}/$type/g")
    message=$(echo "$message" | sed "s/{description}/$description/g")
    
    if [ -n "$body" ]; then
        message=$(printf "%s\n%s" "$message" "$body")
    fi
    
    # Trim any extra spaces
    message=$(echo "$message" | sed 's/  */ /g' | sed 's/^ *//g' | sed 's/ *$//g')
    
    echo "$message"
}

# Function to parse commit message
parse_commit_message() {
    message_content=$(echo "$1" | grep -v '^#') # Ignore comment lines
    
    # Check if message content is empty after removing comments
    if [ -z "$message_content" ]; then
        echo "Error: Commit message content is empty or only contains comments."
        return 1
    fi

    # Extract the first non-comment line for parsing
    first_line=$(echo "$message_content" | head -n 1)

    # Try to extract ticket number (FWF-123) from the first non-comment line
    if echo "$first_line" | grep -qE '^FWF-[0-9]+:'; then
        ticket=$(echo "$first_line" | grep -oE '^FWF-[0-9]+')
        # Remove ticket from the first line
        first_line_no_ticket=$(echo "$first_line" | sed "s/^$ticket: //")
    else
        echo "Error: First line of commit message must start with ticket number (e.g., FWF-123: )"
        return 1
    fi

    # Try to extract type [Feature], [Bugfix], etc. from the rest of the first line
    if echo "$first_line_no_ticket" | grep -qE '^\[[A-Za-z]+\]'; then
        type=$(echo "$first_line_no_ticket" | grep -oE '^\[[A-Za-z]+\]' | grep -oE '[A-Za-z]+')
        # Remove type from the first line
        description=$(echo "$first_line_no_ticket" | sed "s/^\[$type\] //")
    else
        echo "Error: Commit message must include type in brackets after ticket (e.g., [Feature])"
        return 1
    fi

    # The rest of the message content (excluding the first line) is the body
    body=$(echo "$message_content" | tail -n +2)

    # Validate the parsed fields
    if ! validate_commit_fields "$type" "$description" "$ticket"; then
        return 1 # Validation errors are printed by the function
    fi

    # Apply template
    apply_template "$ticket" "$type" "$description" "$body"
    return 0
}

# ALWAYS run interactively now
echo "ℹ️  Starting interactive commit prompt..."

# Get the current branch name and try to extract ticket number
current_branch=$(git symbolic-ref --short HEAD 2>/dev/null)
ticket_from_branch=""
if echo "$current_branch" | grep -qE '.*FWF-[0-9]+.*'; then
    ticket_from_branch=$(echo "$current_branch" | grep -oE 'FWF-[0-9]+')
fi

# Get commit information from user
echo "ℹ️  Please provide the following information:"
ticket_number=$(get_user_input "Enter ticket number (e.g., FWF-123)" "$ticket_from_branch" "true") || exit 1
commit_type=$(select_commit_type) || exit 1
commit_description=$(get_user_input "Enter commit description" "" "true") || exit 1

# Validate the input fields
if ! validate_commit_fields "$commit_type" "$commit_description" "$ticket_number"; then
    echo "❌ Validation failed"
    exit 1
fi

# Ask if there are multiple changes to document
commit_body=""
if get_user_confirmation "Are there multiple changes to document?"; then
    commit_body=$(get_commit_body)
fi

# Build the commit message using the template
commit_msg=$(apply_template "$ticket_number" "$commit_type" "$commit_description" "$commit_body")

# DO NOT save the commit message to file

# Print the final message for review
echo "\nCommit message created:"
echo "-------------------"
echo "$commit_msg"
echo "-------------------"

if ! get_user_confirmation "Proceed with this commit message?"; then
    echo "❌ Commit aborted by user"
    exit 1
fi

# Instead of exiting, execute the commit directly
echo "✅ Committing with generated message..."
# Use double quotes to preserve potential newlines in the message/body
git commit -m "$commit_msg"
exit $? # Exit with the status of the git commit command 