## camunda configs

#### create a secret as forms-flow-bpm  

```
oc process -f forms-flow-bpm-secret.yaml --param-file=prod.env --ignore-unknown-parameters=true |oc create -f -
```

#### create the image in Tools namespace

``` 
oc process -f forms-flow-bpm-bc.yaml|oc create -f -
```

#### create the Statefulset in DEV/TEST/PROD namespace
oc process -f forms-flow-bpm-dc.yaml --param-file=prod.env --ignore-unknown-parameters=true  |oc create -f -
