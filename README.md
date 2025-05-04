# RIG SERVER -- A Developers Guide

## 1. Make sure controller always is in this format
--------------------------------------------------
```javascript

//@desc {personal description}
//@route {method} {/endpoint}
//@access {modifier}

async function callYourFunction (payload,{req}) {
    try{
            let orgId = req?.loggedInUserInfo?.orgId;
            [ ALL YOUR BUSINESS LOGIC ]
            const response = await serviceFunction(orgId);
            return res.status(200).json(responseUtility.build('SUCCESS', response));
    }
    catch(err){
         return next(error);
    }
}
```

## 2. Always wrap entire function in try / catch block. Catch block should only have 1 logger.error and ExceptionalResolver nothing more.
-----------------------------------------------------------------------------------------------------------------------------
```javascript
const serviceFunction = (orgId) => {
    try{

            [ ALL YOUR BUSINESS LOGIC ]
            return "SOMETHING";
    }
    catch(err){
        logger.error(`serviceFunction -> ${err.message}`) // This helps to know at which function error happend.
        ExceptionResolver(err, null);
    }
}
```

## 3. Always throw ONLY Custom Exceptions check exceptions.js which contains wide variety of Error Classes
----------------------------------------------------------------------------------------------------------
```javascript
const serviceFunction = (orgId) => {
    try{

            [ ALL YOUR BUSINESS LOGIC ]
            throw new NotFound(`YOUR CUSTOM MESSAGE`);
    }
    catch(err){
        logger.error(`serviceFunction -> ${err.message}`)
        ExceptionResolver(err, null);
    }
}
```

## 4. Handling custom thrown errors and system generated errors
-----------------------------------------------------------------------------------------------------------
```javascript
const serviceFunction = (orgId) => {
    try{

            [ ALL YOUR BUSINESS LOGIC ]
            [ SYSTEM GENERATED ERRORS ]
    }
    catch(err){
        logger.error(`serviceFunction -> ${err.message}`)
        ExceptionResolver(err, 'YOUR PERSONAL MESSAGE');

        // ExceptionResolver takes care of system errors ( OR ELSE )
        // Provision given to send a personal message also.
    }
}
```

## 5. Standard Response format
-----------------------------------------------------------------------------------------------------------
```javascript

--> Handling Success response

{
    "status": true,
    "statusCode": 200,
    "statusMessage": "Success",
    "response": [... YOUR RETURN]
}

--> Handling Custom Thrown error response
{
    "status": false,
    "statusMessage": [... YOUR ERROR MESSAGE],
    "statusCode": 405
}

--> Handling System generated errors
{
    "status": false,
    "statusMessage": "We encountered an issue while processing your request. Please try again.",
    "statusCode": 500
}

--> Users should not see system generated messages. Only developers should see
    that is the reason ( LOGGERS IN EVERY CATCH BLOCK IS RECOMMENDED )
    example: logger.error(`serviceFunction -> ${err.message}`)

--> Over-riding system generated errors
{
    "status": false,
    "statusMessage": "This site is down. It is currently under maintainance",
    "statusCode": 500
}

--> You can also over-ride Custom Thrown errors but there is no point in throwing first place
    so ( NOT RECOMMENDED )
```

## 5. Under the hood
-----------------------------------------------------------------------------------------------------------
1. Developer need to return whatever he wants and throw the error that he wanted
2. Both responseUtility and errorHandler maintains a standard output format 
3. ExceptionResolver differentiates between custom thrown errors and system generated error 
    (including JavaScript runtime errors, system-level errors, and errors from third-party libraries)
4. You can customize http status code and http status message also just follow 
    httpresponse.js and map in exceptions.js ( Dont forget to export )
5. In cases if you want to over-ride System generated errors standard response also provision is given 
    in ExceptionResolver with a personal message option. Try exploring . Instead of null, add your message

## Happy Coding
-----------------------------------------------------------------------------------------------------------
```javascript
--> dev-vivek
--> Team formulate
```