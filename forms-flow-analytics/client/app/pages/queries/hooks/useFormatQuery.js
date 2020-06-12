import { isFunction, extend, get } from "lodash";
import { useCallback, useRef } from "react";
import { Query } from "@/services/query";
import notification from "@/services/notification";

export default function useFormatQuery(query, syntax, onChange) {
  const onChangeRef = useRef();
  onChangeRef.current = isFunction(onChange) ? onChange : () => {};

  return useCallback(() => {
    Query.format(syntax || "sql", query.query)
      .then(queryText => {
        onChangeRef.current(extend(query.clone(), { query: queryText }));
      })
      .catch(error =>
        notification.error(get(error, "response.data.message", "Failed to format query: unknown error."))
      );
  }, [query, syntax]);
}
