import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({});

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body);

    const userId = body.userId;
    const ttl = Math.floor(Date.now() / 1000) + 300;

    console.log("Registrando:", userId, connectionId);

    await dynamo.send(new PutItemCommand({
        TableName: "connections",
        Item: {
            connectionId: { S: connectionId },
            userId: { S: userId },
            ttl: { N: ttl.toString() }
        }
    }));

    return { statusCode: 200 };
};