# Chat en Tiempo Real con AWS WebSockets (V1)

## 📌 Descripción
Proyecto serverless que implementa un sistema de chat en tiempo real usando WebSockets en AWS.

## 📷 Diagrama de arquitectura

![Arquitectura de proyecto chat v1](https://github.com/JesusAP346/chat-websocket-aws-v1/blob/main/architecture/arquitectura-chat-v1.png?raw=true)


## Servicios usados

- API Gateway (WebSocket)
- AWS Lambda
- DynamoDB
- S3 (frontend)
- CloudFront (HTTPS)

## 📚 Documentación

- [Arquitectura](docs/architecture.md)
- [API Gateway](docs/apigateway.md)
- [Lambda](docs/lambda.md)
- [DynamoDB](docs/dynamodb.md)
- [S3](docs/s3.md)
- [CloudFront](docs/cloudfront.md)


## 🔄 Flujo

1. Cliente se conecta (WebSocket)
2. Se registra con userId
3. Este userID se guarda en una tabla llamada "connections" en DynamoDB
4. Ingresa el nombre de usuario para un envío de mensajes 1 a 1
5. Uso de connectionId para respuesta en tiempo real

## ⚙️ Funcionalidades

- Chat 1 a 1
- Echo sin destinatario
- TTL para limpieza automática

## ⚠️ Limitaciones

- Uso de Scan en DynamoDB
- Sin autenticación real
- Sin control de identidad

## 🚀 Próximos pasos (futura V2)

- Cognito
- JWT
- Authorizers
- Query + GSI
- Infraestructura como código



## 🧑‍💻 Autor
Jesus Antonio Alvarado Peralta