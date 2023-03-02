# Sample Queries

## Fetch form submission data by form path 
```
{
    "collection": "forms",
    "aggregate": [
        {
            "$match": {
            "path": "formpathname"
            }
        },
        {
            "$addFields": {
                "resultId": { "$cond": { 
                    "if": { "$ifNull": [ "$parentFormId",false]},
                    "then": "$parentFormId",
                    "else": "$_id"
                }}
            }
        },
        {
            "$lookup": {
            "from": "forms",
            "let": {"id": "$resultId"},
            "pipeline":[
                        {"$match": { "$expr": {"$or": [
                            {"$eq": ["$_id",{"$convert": {"input": "$$id","to": "objectId"}}]},
                            {"$eq": ["$parentFormId","$$id"]}
                            ]}
                        }},
                        {"$project": {"_id": 1}}
            ],
            "as": "ids"
            }
        },
        {"$unwind": "$ids"},
        {
            "$lookup": {
            "from": "submissions",
            "localField": "ids._id",
            "foreignField": "form",
            "as": "submissionsJoin"
            
                }
        },
        {"$unwind": "$submissionsJoin"},
        {
            "$group": {
                "_id": {
                "department": "$submissionsJoin.data.department"
                },
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "department": "$_id.department",
                "totalSubmissions": "$count"
            }
        }
    ]
}
```



## Fetch form submission data by parent form id or form id 
**Parent Form Id** is the initial form id when the form created 
**Form Id** is specific for each form
#### when you use the parent form id then you will get all the submission data of this form and its versions

```
{
    "collection": "forms",
    "aggregate": [
        {
            "$match": {
                "$or": [
                    {
                        "_id": {
                            "$oid": "formid"
                        }
                    },
                    {
                        "parentFormId": "formid"
                    }
                ]
            }
        },
        {
            "$lookup": {
                "from": "submissions",
                "localField": "_id",
                "foreignField": "form",
                "as": "submissionsJoin"
            }
        },
        {
            "$unwind": "$submissionsJoin"
        },
        {
            "$group": {
                "_id": {
                    "department": "$submissionsJoin.data.department"
                },
                "count": {
                    "$sum": 1
                }
            }
        },
        {
            "$project": {
                "department": "$_id.department",
                "totalSubmissions": "$count"
            }
        }
    ],
    "fields": {
        "department": 1,
        "totalSubmissions": 1
    }
}
```
![image](https://user-images.githubusercontent.com/95394061/218377265-0d967aa4-7f8b-4ae8-b402-fa9396de4f0e.png)

