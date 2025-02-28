"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRMQMessage = generateRMQMessage;
function generateRMQMessage() {
    const randomContentType = [
        "ClientRegisterMsg",
        "ClientRegMsg",
        "ClientRegEchoMsg",
        "ClientHeartbeatTimeoutMsg",
        "ClientTaskCreateMsg",
        "DeviceRegMsg",
        "ImageReadyMsg",
        "UploadImageMsg",
        "UploadImageEchoMsg",
        "FileTransportTaskFinishMsg",
        "BizCreatEventMsg",
        "ImageJudgeMsg",
        "ImageCheckTaskMsg",
        "ClientStateMsg",
        "ClientStateEchoMsg",
        "Cashed",
    ][Math.floor(Math.random() * 16)];
    const radomRoutingKey = [
        "5B97-ED2E-B98E-E7EE binding.dev.out",
        "5B97-ED2E-B98E-E7EE binding.dev.in",
        "connect.192.168.111.164.client.out",
        "server.messagebus",
        "server.transport.out",
        "server.process.in",
        "server.process.out",
        "192.168.111.164.client.in",
        "192.168.111.164.client.out",
    ][Math.floor(Math.random() * 9)];
    const randomImageId = ["1234", "5678", "91011"][Math.floor(Math.random() * 3)];
    const MessageTime = new Date().toLocaleString("zh-CN", {
        hour12: false,
        timeZone: "Asia/Shanghai",
    });
    return {
        time: MessageTime,
        routing_key: radomRoutingKey,
        content_type: randomContentType,
        message_body: {
            rk: radomRoutingKey,
            ct: randomContentType,
            header: {
                src: "server",
                time: MessageTime,
            },
            image_id: randomImageId,
            user_id: "user001",
            image_type: "JPEG",
            judge: MessageTime,
            result: "KEEP",
            tag: {
                type: 0,
                sub_type: 0,
                x: 316,
                y: 128,
                width: 129,
                height: 87,
                view_id: 0,
            },
            image_path: "/path/to/image",
        },
    };
}
