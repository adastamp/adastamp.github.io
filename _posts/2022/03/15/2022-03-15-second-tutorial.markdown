---
authors: Hasan Shahid, Michal J. Gajda

title: Calling StreamCardano from ReactJS and Typescript

date: 2022-11-26

layout: post

categories: tutorial

description: "Call StreamCardano from the Typescript ReactJS web application, parse responses, and examine results."

---

  

We will show you how to call StreamCardano API using [ReactJS](https://reactjs.org/) and Promise-based HTTP client **[KY](https://www.npmjs.com/package/ky)**, parse the responses, test and debug your queries.

  

# Preliminaries

Firstly, create a React app with a typescript template from scratch using __create-react-app(CRA)__ in the directory, this will scaffold a [basic typescript ReactJS](https://create-react-app.dev/docs/adding-typescript/) project for us:

```json
npx create-react-app my-app --template typescript
```  

Let's [setup the environment variables](https://upmostly.com/tutorials/how-to-use-environment-variables-in-reactjs-applications) so our Typescript code does not hold our configuration and secrets, make sure to name your environment variables starting with __REACT_APP__ naming convention otherwise your React application will not pick them:

  

```{file=.env}
REACT_APP_STREAMCARDANO_HOST=beta.streamcardano.dev
REACT_APP_STREAMCARDANO_KEY=YOUR_API_KEY_HERE
```

Next, change into your project directory and run your application and view it on your browser at __localhost:3000__

```{file="runit.sh"}
cd my-app
npm start
```

Then let's install the important packages that will help us use __StreamCardano API__:

```{file="runit.sh"}
npm i ky @microsoft/fetch-event-source react-json-pretty
```

# Setting Up KY

Under the src directory of your project, make another directory called __config__ and over there let's configure our KY configurations:

```{.ts file=src/config/https.ts}
import ky, { KyResponse, Options } from "ky";

/**
 *
 * @param request
 * @param options Options are the same as window.fetch, with some exceptions.
 * @param response
 * @returns the body of the response as a new Fetch API interfaced response
 */
const transformResponse = (
  request: Request,
  options: Options,
  response: KyResponse
) => {
  return new Response(response.body);
};

// modifying our ky instance configuration
export const kyInstance = ky
  .create({ prefixUrl: process.env.REACT_APP_STREAMCARDANO_HOST })
  .extend({
    /**
     * here we have tweaked the response to the request
     * using one of the hooks provided by ky to transform our response
     * this is done over here for code reusability so that we don't have
     * to do the same configuration with every request
     */
    hooks: {
      afterResponse: [transformResponse],
    },
  });
```
  

# Checking if the Service Is Online

I suggest that you start by testing our API online, to make sure your internet connection works. Under the src directory let's make another directory called __hooks__ and define our custom hooks in there.

```{.ts file=src/hooks/StatusCheck.ts}
import { kyInstance } from "../config/https";

/**
 * Custom hook for the endpoint.
 * We have defined a custom hook here for the code reusability,
 * if we need the same piece of code or data is fetched from the API
 * in multiple components we can consume the same custom hook defined here
 * to consume data from one source of truth.
 * @returns Response
 */
const useCheckStatus = async () => {
  const data: Response = await kyInstance.get("api/v1/status");
  return data.json();
};
export { useCheckStatus };
```

Before we start consuming our custom hook let's create the interface for the status response from StreamCardano:
```{.ts file=src/interfaces/StatusCheck.interface.ts}

/**
 * @typedef StatusCheck
 * @property {Array<string>} error                          The list of errors
 * @property {IResult}       result                         The response from the endpoint
 */

/** @type {StatusCheck} */
export interface IStatus {
  errors: Array<string>;
  result: IResult;
}

/**
 * @typedef Result
 * @property {IAppVersionInfo}        app_version_info          Status information about this backend application and attached services.
 * @property {Array<IDatabaseTrigger} database_triggers         Database triggers set for the application.
 * @property {boolean}                pgbouncer_working         Whether the Postgres connection pooling daemon `pgbouncer` is online.
 * @property {boolean}                postgres_working          Whether the Postgres database is online.
 * @property {number}                 sync_status               ($PyYmMdDThHmMs[.sss]S) How far behind the blockchain is the database?
 */

/** @type {Result} */
export interface IResult {
  app_version_info: IAppVersionInfo;
  database_triggers: Array<IDatabaseTrigger>;
  pgbouncer_working: boolean;
  postgres_working: boolean;
  sync_status: number;
}

/**
 * @typedef AppVersionInfo
 * @property {string} appCommit                             Current commit hash of the StreamCardano API backend.
 * @property {string} appVersion                            Current version of the StreamCardano API backend.
 * @property {string} envName                               Build Environment
 */

/** @type {AppVersionInfo} */
export interface IAppVersionInfo {
  appCommit: string;
  appVersion: string;
  envName: string;
}

/**
 * @typedef DatabaseTrigger
 * @property {string} triggerEventManipulation              Target action for the trigger.
 * @property {string} triggerEventTable                     Type of event the trigger is listening to.
 * @property {string} triggerName                           Trigger name.
 */
export interface IDatabaseTrigger {
  triggerEventManipulation: string;
  triggerEventTable: string;
  triggerName: string;
}
```

Now, Call our custom hook inside custom component __StatusCheck.tsx__ to see the response from the StreamCardano API

```{.ts file=src/components/StatusCheck.tsx}
import React, { useEffect, useState } from "react";

/**
 * This is a lightweight and tiny react component
 * that helps you to format and prettify the JSON data.
 */
import JSONPretty from "react-json-pretty";
import { useCheckStatus } from "../hooks/StatusCheck";
import { IStatus } from "../interfaces/StatusCheck.interface";

/**
 * Status Check Component
 * @type {React.FC<Props>}
 * @returns {React.ReactElement}
 */
function StatusCheck(): React.ReactElement {
  const [status, setStatus] = useState<IStatus>();
  const checkStatus = useCheckStatus();

  /**
   * Class component in React contains lifecycle methods
   * which helps us to jump into the different states/periods of the component
   * But functional components don't provide these lifecycle methods
   * but it can still be achieved using the useEffect hook
   * useEffect with empty braces as second argument acts as a Component Did Mount lifecycle
   */
  useEffect(() => {
    checkStatus.then((data) => {
      setStatus(data);
    });
  }, []);

  return (
    <div>
      <h3>
        Retrieve status information about the backend. Does not require
        authentication.
        <br />
        <strong>GET</strong> /api/v1/status
        <br />
        <br />
        <strong>Response:</strong>
        <p>
          <JSONPretty data={JSON.stringify(status)} />
        </p>
      </h3>
    </div>
  );
}

export default StatusCheck;
```

### Rendered output of the component

![Rendered output of the StatusCheck.tsx component](src/assets/StatusCheck.png)

The response can be transformed as well on the client side:

```json
{
    "errors": [],
    "result": {
        "app_version_info": {
            "versionAppCommit": "0e3714d6d9b05d435ae34850ef798da26416b4a6",
            "versionAppVersion": "0.1.0.0",
            "versionEnvName": "TestEnv"
        },
        "database_triggers": [{
                "event_manipulation": "INSERT",
                "event_table": "block",
                "name": "blocks_changed"
            },
            {
                "event_manipulation": "DELETE",
                "event_table": "block",
                "name": "blocks_changed"
            },
            {
                "event_manipulation": "UPDATE",
                "event_table": "block",
                "name": "blocks_changed"
            }
        ],
        "pgbouncer_working": true,
        "postgres_working": true,
        "sync_status": 4883.902512
    }
}
```

You can also use this endpoint to check your work on the latest version of the application API library.

This is the only call that does not require authorization. You may also see the [API status here](https://status.streamcardano.com/).

## Authorization

You need to consume the API key for all the other endpoints:  

The _`Authorization` header_ needs to be sent with the `${REACT_APP_STREAMCARDANO_KEY}` value. 

You have a developer key with a unique id for your application. For now, you may use all developer APIs at a limited rate. To deploy in production, you will get a key with only a limited functionality but a much higher allowed query rate that permits thousands of simultaneous users.

  

## Checking That StreamCardano Is Up-to-Date With the Cardano Network?

You may now check what the last block ID recorded in the database, let's create our custom hook for this endpoint:

```{.ts file=src/hooks/LastBlock.ts}
import { kyInstance } from "../config/https";

/**
 * Custom hook for the endpoint.
 * We have defined a custom hook here for the code reusability,
 * if we need the same piece of code or data is fetched from the API
 * in multiple components we can consume the same custom hook defined here
 * to consume data from one source of truth.
 * @returns Response
 */
const useGetLastBlock = async () => {
  const data: Response = await kyInstance.get("api/v1/last/block", {
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_STREAMCARDANO_KEY}`,
    },
  });
  return data.json();
};
export { useGetLastBlock };
```

Followed by the interface for this endpoint:

```{.ts file=src/interfaces/LastBlock.interface.ts}
/**
 * @typedef LastBlock
 * @property {Array<string>} errors           The list of errors
 * @property {number}        result           The sequential number of the last block in the blockchain.
 */

/** @type {LastBlock} */
export interface ILastBlock {
  errors: Array<string>;
  result: number;
}
```

and now for the custom component for this endpoint

```{.ts file=src/components/LastBlock.tsx}
import React, { useEffect, useState } from "react";

/**
 * This is a lightweight and tiny react component
 * that helps you to format and prettify the JSON data.
 */
import JSONPretty from "react-json-pretty";
import { useGetLastBlock } from "../hooks/LastBlock";
import { ILastBlock } from "../interfaces/LastBlock.interface";

/**
 * Last Block Component
 * @type {React.FC<Props>}
 * @returns {React.ReactElement}
 */
function LastBlock(): React.ReactElement {
  const lastBlock = useGetLastBlock();
  const [lastBlockData, setLastBlockData] = useState<ILastBlock>();

  /**
   * Class component in React contains lifecycle methods
   * which helps us to jump into the different states/periods of the component
   * But functional components don't provide these lifecycle methods
   * but it can still be achieved using the useEffect hook
   * useEffect with empty braces as second argument acts as a Component Did Mount lifecycle
   */
  useEffect(() => {
    lastBlock.then((data) => {
      setLastBlockData(data);
    });
  }, []);
  return (
    <div>
      <h3>
        Get the number of the last block.
        <br />
        <strong>GET</strong> /api/v1/last/Block
        <br />
        <br />
        <strong>Response:</strong>
        <p>
          <JSONPretty data={JSON.stringify(lastBlockData)} />
        </p>
      </h3>
    </div>
  );
}

export default LastBlock;
```

### Rendered output of the component

![Rendered output of the LastBlock.tsx component](src/assets/LastBlock.png)

# Selecting data by custom query

To get better performance you may want to avoid transmitting unnecessary data.

To achieve this, we will use a custom SQL query that only gets a block number, hash, and transaction count within the block. 

Before we start consuming our custom hook let's create the interface for query response from StreamCardano:

``` {.ts file=src/interfaces/Query.interface.ts}
/**
 * @typedef Query
 * @property {Array<string>} error        The list of errors
 * @property {IQueryData}    result       The response from the endpoint
 */

/** @type {Query} */
export interface IQuery {
  errors: Array<string>;
  result: Array<IQueryData>;
}

/**
 * @typedef QueryData
 * @property {number} block_no
 * @property {string} hash
 * @property {number} tx_count
 */

/** @type {QueryData} */
export interface IQueryData {
  block_no: number;
  hash: string;
  tx_count: number;
}
```

```{.ts file=src/hooks/Query.ts}

import { kyInstance } from "../config/https";

/**
 * Custom hook for the endpoint.
 * We have defined a custom hook here for the code reusability,
 * if we need the same piece of code or data is fetched from the API
 * in multiple components we can consume the same custom hook defined here
 * to consume data from one source of truth.
 * @returns Response
 */
const useQuery = async () => {
  const data: Response = await kyInstance.post("api/v1/query", {
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_STREAMCARDANO_KEY}`,
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: "SQL_QUERY",
  });
  return data.json();
};

export { useQuery };
```

## Listing transaction data of Your smart contract

Let’s search for the most recent transaction from any smart contract on the Testnet and consume our query hook with a new SQL query.

Query would be `SELECT tx_id, value FROM datum ORDER BY tx_id DESC LIMIT 1`:

```{.ts file=src/components/Query.tsx}
import React, { useEffect, useState } from "react";

/**
 * This is a lightweight and tiny react component
 * that helps you to format and prettify the JSON data.
 */
import JSONPretty from "react-json-pretty";

import { useQuery } from "../hooks/Query";
import { IQuery } from "../interfaces/Query.interface";

/**
 * Query Component
 * @type {React.FC<Props>}
 * @returns {React.ReactElement}
 */
function Query(): React.ReactElement {
  const postQuery = useQuery();
  const [data, setData] = useState<IQuery>();

  /**
   * Class component in React contains lifecycle methods
   * which helps us to jump into the different states/periods of the component
   * But functional components don't provide these lifecycle methods
   * but it can still be achieved using the useEffect hook
   * useEffect with empty braces as second argument acts as a Component Did Mount lifecycle
   */
  useEffect(() => {
    postQuery.then((data) => {
      setData(data);
    });
  }, []);

  return (
    <div>
      <h3 className="Post">
        Run a custom database query and retrieve its results.
        <br />
        <strong>POST</strong> /api/v1/query
        <br />
        <br />
        <strong>Response:</strong>
        <p>
          <JSONPretty data={JSON.stringify(data)} />
        </p>
      </h3>
    </div>
  );
}

export default Query;
```

### Rendered output of the component

![Rendered output of the Query.tsx component](src/assets/CustomQuery.png)

The response can be transformed as well on the client side:

```json
[{
  "tx_id": 5294399,
  "value": {
    "constructor": 1,
    "fields": [{
      "constructor": 0,
      "fields": [{
        "constructor": 0,
        "fields": [{
          "bytes": "b2ff7b709174bfc6c65b7be977b8d7320c03f0eaa8e2f5305d1b9aad"
        }]
      }, {
        "constructor": 0,
        "fields": [{
          "constructor": 0,
          "fields": [{
            "int": 407011
          }, {
            "int": 1667831254999
          }]
        }]
      }]
    }]
  }
}]
```

  

## Debugging Your Query

In case you get any error, you may use the post to `/api/v1/debug/query` and get additional debugging information:

Before we start consuming our custom hook let's create the interface for debug query response from StreamCardano:

```{.ts file=src/interfaces/Debug.interface.ts}

/**
 * @typedef DebugQuery
 * @property {Array<string>} error        The list of errors
 * @property {IResult}       result       The response from the endpoint
 */

/** @type {DebugQuery} */
export interface IDebugQuery {
  error: Array<string>;
  result: IResult;
}

/**
 * @typedef Result
 * @property {string}        compile_time  Time to compile the SQL query, in seconds.
 * @property {Array<string>} explain       PostgreSQL explanation of the query.
 * @property {string}        orig_sql      Original SQL query, as sent in the request.
 * @property {Array<string>} params        Query parameters given as input.
 * @property {Array<string>} results       Query results.
 * @property {string}        sql           Original SQL query, after parsing.

 */

/** @type {Result} */
export interface IResult {
  compile_time: string;
  explain: Array<string>;
  orig_sql: string;
  params: Array<string>;
  results: Array<string>;
  sql: string;
}
```

```{.ts file=src/hooks/DebugQuery.ts}
import { kyInstance } from "../config/https";

/**
 * Custom hook for endpoint.
 * We have defined a custom hook here for the code reusability,
 * if we need the same piece of code or data is fetched from the API
 * in multiple components we can consume the same custom hook defined here
 * to consume data from one source of truth.
 * @returns Response
 */
const useDebugQuery = async () => {
  const data: Response = await kyInstance.post("api/v1/debug/query", {
    headers: {
      Authorization: `Bearer ${process.env.REACT_APP_STREAMCARDANO_KEY}`,
      "content-type": "text/plain;charset=utf-8",
    },
    body: "SQL_QUERY_TO_BE_DEBUGGED",
  });
  return data.json();
};
export { useDebugQuery };
```

Consuming our custom hook inside the custom component

```{.ts file=src/components/DebugQuery.tsx}
import React, { useEffect, useState } from "react";

/**
 * This is a lightweight and tiny react component
 * that helps you to format and prettify the JSON data.
 */
import JSONPretty from "react-json-pretty";
import { useDebugQuery } from "../hooks/DebugQuery";
import { IDebugQuery } from "../interfaces/Debug.interface";

/**
 * DebugQuery Component
 * @type {React.FC<Props>}
 * @returns {React.ReactElement}
 */
function DebugQuery(): React.ReactElement {
  const DebugQuery = useDebugQuery();
  const [data, setData] = useState<IDebugQuery>();

  /**
   * Class component in React contains lifecycle methods
   * which helps us to jump into the different states/periods of the component
   * But functional components don't provide these lifecycle methods
   * but it can still be achieved using the useEffect hook
   * useEffect with empty braces as second argument acts as a Component Did Mount lifecycle
   */
  useEffect(() => {
    DebugQuery.then((data) => {
      setData(data);
    });
  }, []);

  return (
    <div>
      <h3 className="Post">
        Run a custom database query and retrieve its results along with
        additional debug information.
        <br />
        <strong>POST</strong> /api/v1/debug/query
        <br />
        <br />
        <strong>Response:</strong>
        <p>
          <JSONPretty data={JSON.stringify(data)} />
        </p>
      </h3>
    </div>
  );
}

export default DebugQuery;
```

### Rendered output of the component

![Rendered output of the DebugQuery.tsx component](src/assets/DebugQuery.png)

The response can be transformed as well on the client side:

```json
{
  "CompileTime": 0.003751576,
  "EXPLAIN": ["Limit (cost=3106846.97..3106846.97 rows=1 width=40)", " CTE dats", " -> Merge Join (cost=1690196.68..2675203.90 rows=17265723 width=917)", " Merge Cond: (tx_out.tx_id = datum.tx_id)", " -> Index Only Scan using idx_tx_out_tx_id on tx_out (cost=0.43..786046.51 rows=13825337 width=8)", " -> Materialize (cost=1592925.03..1598390.94 rows=1093182 width=917)", " -> Sort (cost=1592925.03..1595657.99 rows=1093182 width=917)", " Sort Key: datum.tx_id", " -> Seq Scan on datum (cost=0.00..160561.82 rows=1093182 width=917)", " -> Sort (cost=431643.08..474807.38 rows=17265723 width=40)", " Sort Key: dats.tx_id DESC", " -> CTE Scan on dats (cost=0.00..345314.46 rows=17265723 width=40)"],
  "OrigSQL": "WITH dats AS (SELECT datum.tx_id, datum.value FROM datum, tx_out WHERE datum.tx_id=tx_out.tx_id) SELECT * FROM dats ORDER BY tx_id DESC LIMIT 1",
  "Params": [],
  "SQL": "SELECT json_agg(t) FROM (WITH dats AS (SELECT datum.tx_id, datum.value FROM (SELECT datum.* FROM datum INNER JOIN tx ON datum.tx_id = tx.id INNER JOIN (SELECT * FROM block WHERE block_no <= $1) AS block ON block.id = tx.block_id ORDER BY datum.id DESC LIMIT $2) AS datum, (SELECT tx_out.* FROM tx_out INNER JOIN tx ON tx_out.tx_id = tx.id INNER JOIN (SELECT * FROM block WHERE block_no <= $1) AS block ON block.id = tx.block_id ORDER BY tx_out.id DESC LIMIT $2) AS tx_out WHERE datum.tx_id = tx_out.tx_id) SELECT * FROM dats ORDER BY tx_id DESC LIMIT 1) AS t"
}
```

## Streaming Events of StreamCardano API

For streaming events we will use __fetchEventSource__ from [@microsoft/fetch-event-source](https://www.npmjs.com/package/@microsoft/fetch-event-source) npm package, to smoothly receive live events.

```{.ts file=src/components/SSE.tsx}
import React, { useEffect, useState } from "react";

/**
 * This package provides a better API for making Event Source requests - also known as server-sent events - with all the features available in the Fetch API.
 * You can pass in all the other parameters exposed by the default fetch API, for example:
 */
import { fetchEventSource } from "@microsoft/fetch-event-source";

/**
 * This is a lightweight and tiny react component
 * that helps you to format and prettify the JSON data.
 */
import JSONPretty from "react-json-pretty";

/**
 * Server-Sent Events Component
 * Server Sent Event Component using @microsoft/fetch-event-source npm package
 * to receive events from the server and keep listening
 * refreshing and getting that every 10 seconds
 * accepting the event-stream type of data.
 * With a query for the user to decide which type of data they want
 * @type {React.FC<Props>}
 * @returns {React.ReactElement}
 */
function SSE(): React.ReactElement {
  const [sseData, setSSEData] = useState<any>();

  /**
   * Class component in React contains lifecycle methods
   * which helps us to jump into the different states/periods of the component
   * But functional components don't provide these lifecycle methods
   * but it can still be achieved using the useEffect hook
   * useEffect with empty braces as second argument acts as a Component Did Mount lifecycle
   */
  useEffect(() => {
    const fetchData = async () => {
      await fetchEventSource(
        `${process.env.REACT_APP_STREAMCARDANO_HOST}/api/v1/sse`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_STREAMCARDANO_KEY}`,
            Accept: "text/event-stream",
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: "WITH selected_blocks AS (SELECT * FROM block WHERE block_no IS NOT NULL AND block_no <= $1 :: int4 ORDER BY block_no DESC limit $2 :: int4) SELECT b.block_no :: int4, b.block_time :: timestamp?, Floor (Sum(tx.fee / b.tx_count)) :: int4? AS avg_block_fee FROM selected_blocks AS b LEFT JOIN tx ON b.id = tx.block_no GROUP BY block_no, block_time ORDER BY block_no DESC",
          onopen(res: Response): any {
            /**
             * @name 200 Status Code means a successful connection was made with the server
             * @name 400 Status Code means Bad Request and there is something wrong with the HTTP request
             * @name 500 Status Code means Internal Server Error a generic error
             * that indicates the server encountered an unexpected condition and can’t fulfill the request.
             * @name 429 Status Code means Too many requests. The server responds with this code
             * when the user has sent too many requests in the given time and has exceeded the rate limit.
             */
            if (res.ok && res.status === 200) {
              console.log("Connection made ", res);
            } else if (
              res.status >= 400 &&
              res.status < 500 &&
              res.status !== 429
            ) {
              console.log("Client side error ", res);
            }
          },
          onmessage(event) {
            console.log(event.data);
            const parsedData = JSON.parse(event.data);
            setSSEData(parsedData);
          },
          onclose() {
            console.log("Connection closed by the server");
          },
          onerror(err) {
            console.log("There was an error from server", err);
          },
        }
      );
    };
    fetchData();
  }, []);
  return (
    <div>
      <h3 className="Post">
        Listen to new blocks on the chain
        <br />
        <strong>POST</strong> /api/v1/sse
        <br />
        <br />
        <strong>Response:</strong>
        <p>
          <JSONPretty data={JSON.stringify(sseData)} />
        </p>
      </h3>
    </div>
  );
}

export default SSE;
```

### Rendered output of the component

![Rendered output of the SSE.tsx component](src/assets/SSE.png)

And you can keep receiving live and any new events every 10 seconds :

```json
{
  "data": [{
    "block_no": 3930459,
    "hash": "\\x8fd95640cfad377839795be890a69c58be66b5bba3831104aa499d2e010c9f6b",
    "tx_count": 1
  }],
  "event": "new_block"
} {
  "data": [{
    "block_no": 3930460,
    "hash": "\\xcc2d0bf9457a493404dac2444eb28baf80cac0fc611d8d395153db1abacac05a",
    "tx_count": 0
  }],
  "event": "new_block"
}
```

# Conclusion

Now to consume all our custom components in __App.tsx__

```{.ts file=src/App.tsx}
import React from "react";
import "./App.css";
import DebugQuery from "./components/DebugQuery";
import LastBlock from "./components/LastBlock";
import Query from "./components/Query";
import SSE from "./components/SSE";
import StatusCheck from "./components/StatusCheck";

/**
 * Main App Component
 * @type {React.FC<Props>}
 * @returns {React.ReactElement}
 */
function App(): React.ReactElement {
  return (
    <div className="App">
      <StatusCheck />
      <Query />
      <DebugQuery />
      <LastBlock />
      <SSE />
    </div>
  );
}

export default App;
```

## Run in DEV Environment 

To run this code in your local environment in the dev environment, clone the application and then:

```{file="runit.sh"}
cd my_app
npm install
npm start
```

and then view the application at [localhost:3000.](http://localhost:3000/). Add your API key in .env to study responses.


![Rendered output of the App.tsx component](src/assets/App.png)

## Build & Deploy 🏗

You can also build this application with the following command. Then drag and [drop the build folder to AWS S3](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/deploy-a-react-based-single-page-application-to-amazon-s3-and-cloudfront.html) to deploy your web application.

```{file="runit.sh"}
npm run build
```

## Also See 👀

🚀 [Stream Cardano API Primer](https://streamcardano.com/tutorials/2022-10-25-primer/)

🚀 [Calling Stream Cardano from Haskell](https://streamcardano.com/tutorials/2022-11-11-haskell-primer/)

🚀 [Streaming Events of StreamCardano API Primer in Haskell](https://streamcardano.com/tutorials/2022-11-19-haskell-streaming/)

🚀 [Cardano Summit Workshop](https://streamcardano.com/tutorials/2022-11-20-cardano-summit-tutorial/)

## Libraries and Packages Used 📦

📦 [Fetch Server Sent Events by Microsoft](https://www.npmjs.com/package/@microsoft/fetch-event-source)

📦 [Https client to make server requests](https://www.npmjs.com/package/ky)

📦 [Typescript](https://www.npmjs.com/package/typescript)

📦 [React Pretty JSON](https://www.npmjs.com/package/react-json-pretty)

## Literate Programming Using [Entangled](https://entangled.github.io/manual.html#)

Entangled helps you write Literate Programs in Markdown. You put all your code inside Markdown code blocks. Entangled automatically extracts the code and writes it to more traditional source files. You can then edit these generated files, and the changes are fed back to the Markdown.

FYI, This README just [tangled](https://entangled.github.io/manual.html#) you. 😁
