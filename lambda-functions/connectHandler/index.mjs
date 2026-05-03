export const handler = async (event) => {
    console.log("Connected:", event.requestContext.connectionId);
    return { statusCode: 200 };
};