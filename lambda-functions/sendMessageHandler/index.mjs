import {
  DynamoDBClient,
  ScanCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";

import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand
} from "@aws-sdk/client-apigatewaymanagementapi";

const dynamo = new DynamoDBClient({});

export const handler = async (event) => {
  console.log("EVENT:", JSON.stringify(event));

  try {
    const domain = event.requestContext.domainName;
    const stage = event.requestContext.stage;

    const client = new ApiGatewayManagementApiClient({
      endpoint: `https://${domain}/${stage}`
    });

    const body = event.body ? JSON.parse(event.body) : {};
    const targetUser = body.to;
    const message = body.message || "";

    const senderConnectionId = event.requestContext.connectionId;

    // 🔍 Obtener todas las conexiones
    const data = await dynamo.send(new ScanCommand({
      TableName: "connections"
    }));

    const connections = data.Items || [];

    // 🔍 Obtener userId del que envía
    const senderItem = connections.find(
      item => item.connectionId?.S === senderConnectionId
    );

    const senderUserId = senderItem?.userId?.S || "unknown";

    // 🟡 Caso: sin destinatario → enviar a sí mismo (echo)
    if (!targetUser) {
      console.log("No target → sending to self");

      await client.send(new PostToConnectionCommand({
        ConnectionId: senderConnectionId,
        Data: Buffer.from(JSON.stringify({
          type: "self",
          from: senderUserId,
          message: message
        }))
      }));

      return { statusCode: 200 };
    }

    // 🔍 Buscar destinatario
    const target = connections.find(
      item => item.userId?.S === targetUser
    );

    if (!target) {
      console.log("Usuario no encontrado:", targetUser);

      await client.send(new PostToConnectionCommand({
        ConnectionId: senderConnectionId,
        Data: Buffer.from(JSON.stringify({
          type: "error",
          message: `Usuario ${targetUser} no encontrado`
        }))
      }));

      return { statusCode: 200 };
    }

    const targetConnectionId = target.connectionId.S;

    try {
      // 📤 Enviar mensaje al destinatario
      await client.send(new PostToConnectionCommand({
        ConnectionId: targetConnectionId,
        Data: Buffer.from(JSON.stringify({
          type: "private",
          from: senderUserId,
          message: message
        }))
      }));

    } catch (err) {
      console.error("Error enviando:", err);

      // 🔴 conexión muerta
      if (err.$metadata?.httpStatusCode === 410) {
        console.log("Conexión muerta, eliminando:", targetConnectionId);

        await dynamo.send(new DeleteItemCommand({
          TableName: "connections",
          Key: {
            connectionId: { S: targetConnectionId }
          }
        }));
      }
    }

    return { statusCode: 200 };

  } catch (error) {
    console.error("ERROR GENERAL:", error);
    return { statusCode: 500 };
  }
};