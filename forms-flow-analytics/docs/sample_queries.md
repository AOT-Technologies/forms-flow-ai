# Sample Queries

## Type of Business License application

**Form** : Create New Business License Application

```
{
  "collection": "forms",
  "aggregate": [
    {
      "$match": {
        "name": "createNewBusinessLicenseApplication"
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
          "owner": "$submissionsJoin.owner",
          "type": "$submissionsJoin.data.typeOfBussiness"
        },
        "count": {
          "$sum": 1
        }
      }
    },
    {
      "$project": {
        "Owner": "$_id.owner",
        "Type": "$_id.type",
        "totalSubmissions": "$count"
      }
    }
  ],
  "fields": {
    "Type": 1,
    "totalSubmissions": 1
  }
}
```

![image](https://user-images.githubusercontent.com/70306694/125458437-d0daf0c6-fd35-4c4b-8706-ca61c4f6738c.png)



## Preferred Method of FOI


**Form** : Freedom of Information and Protection of Privacy


```
{
    "collection": "forms",
    "aggregate": [
        {
            "$match": {
                "name": "freedomOfInformationAndProtectionOfPrivacy"
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
                    "body": "$submissionsJoin.data.preferredMethodOfAccessToRecords",
                    "applicationId": "$submissionsJoin.data.applicationId",
                    "count": "1"
                }
            }
        }
    ]
}
```

![image](https://user-images.githubusercontent.com/70306694/125458356-0889b154-84af-4819-b280-35b1778c57ad.png)

