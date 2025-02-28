"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { io, Socket } from "socket.io-client";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import ConnectRMQ from "@/components/connectRMQ";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MessageExample from "@/components/messageExample";
import InputComponent from "@/components/inputComponent";
import { Label } from "@/components/ui/label";

import { columns } from "@/components/messageList/columns";
import { DataTable } from "@/components/messageList/data-table";

import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import MultipleSelector, { Option } from "@/components/multiple-selector";
import { CircleHelp, Clipboard, Loader2 } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

export interface RMQMessage {
  time: string;
  routing_key: string;
  content_type: string;
  message_body: Record<string, any>;
}

interface Filter {
  messageFilter: Option[];
  MaxItems: string;
}

const HomePage = () => {
  // socket
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<RMQMessage[]>([]);

  // message-filter
  const [filter, setFilter] = useState<Filter>({
    messageFilter: [],
    MaxItems: "100",
  });
  const [isApplied, setIsApplied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  //message - display
  const [selectedRow, setSelectedRow] = useState<Object>();
  const [codeCopied, setCodeCopied] = useState(false);

  // log file
  const [logTofileMessages, setLogToFileMessages] = useState({});
  const [isLoggingToFile, setIsLoggingToFile] = useState(false);

  // RMQ Message - socket
  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("I am connected");
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("message");
        socket.off("startLogging");
        socket.off("logToFile");
        socket.disconnect();
        console.log(socket);
        setIsLoggingToFile(false);
      }
    };
  }, [socket]);

  // RMQ Message - logging to file
  useEffect(() => {
    if (logTofileMessages) {
      socket?.emit("logToFile", logTofileMessages);
      console.log("Sent periodic message to server:", logTofileMessages);
    }
  }, [logTofileMessages]);

  // socket - connection
  const handleConnect = ({
    host,
    exchange,
    binding,
  }: {
    host: string;
    exchange: string;
    binding: string;
  }) => {
    if (host === "127.0.0.1" && exchange === "amq.topic" && binding === "#") {
      const newSocket = io("http://localhost:8000");
      setSocket(newSocket);
      setIsConnected(true);
    } else {
      toast("连接失败", {
        description: "请输入正确的RMQ连接配置!",
      });
      setIsConnected(false);
    }
  };

  const handleDisconnect = () => {
    if (isConnected && socket) {
      socket.off("connect");
      socket.off("message");
      socket.off("startLogging");
      socket.off("LogToFile");
      socket.disconnect();
      setIsConnected(false);
      setIsApplied(false);
      setIsPaused(false);
      setIsLoggingToFile(false);
    }
  };

  // Message Filter
  const OPTIONS: Option[] = [
    { label: `"Cached" not in c`, value: `"Cached" not in c` },
    { label: `"State" not in c`, value: `"State" not in c` },
  ];

  const handleOptionsChange = (newOptions: Option[]) => {
    setFilter((prevFilter) => ({
      ...prevFilter,
      messageFilter: newOptions,
    }));
    setIsApplied(false);
  };

  const handleMaxItemsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFilter((prevFilter) => ({
      ...prevFilter,
      MaxItems: value,
    }));
    if (filter.MaxItems !== value) {
      setIsApplied(false);
    }
  };

  const updateRMQMessages = (socket: any) => {
    socket.on("message", (message: RMQMessage) => {
      console.log("Received message:", message);
      const isMesssageValid = filter.messageFilter.every((filterItem) => {
        const keyword = filterItem.value
          .match(/'([^']+)'|"([^"]+)"/)?.[0]
          ?.replace(/['"]/g, "");

        if (!keyword) {
          return (
            message.content_type.includes(filterItem.value) ||
            message.routing_key.includes(filterItem.value)
          );
        }

        if (filterItem.value.includes("not in c")) {
          return !message.content_type.includes(keyword);
        }
        if (filterItem.value.includes("not in r")) {
          return !message.routing_key.includes(keyword);
        }
        if (filterItem.value.includes("in c")) {
          return message.content_type.includes(keyword);
        }
        if (filterItem.value.includes("in r")) {
          return message.routing_key.includes(keyword);
        }

        return (
          message.content_type.includes(keyword) ||
          message.routing_key.includes(keyword)
        );
      });
      if (isMesssageValid) {
        setMessages((prevMessages) => {
          const updateMessages = [...prevMessages, message];
          const maxItems = Number(filter.MaxItems);
          return updateMessages.slice(-maxItems);
        });
        setLogToFileMessages(message);
      }
    });
  };

  const handleApply = () => {
    if (socket) {
      socket.off("message");
      setMessages([]);
    }

    if (filter.MaxItems === "") {
      setFilter((prevFilter) => ({
        ...prevFilter,
        MaxItems: "100",
      }));
    }

    if (socket && isConnected && !isPaused) {
      updateRMQMessages(socket);
    }

    setIsApplied(true);
  };

  const handlePause = () => {
    if (socket && isApplied) {
      socket.off("message");
      console.log("socket is paused.");
    }
    setIsPaused(true);
  };

  const handleContinue = () => {
    if (socket && isPaused && isApplied) {
      updateRMQMessages(socket);
    }
    setIsPaused(false);
    setIsApplied(true);
  };

  const handleClear = () => {
    setMessages([]);
  };

  // Message Display
  // message_body code format
  const handleSelectedRow = (selectedRowMessageBody: {}) => {
    setSelectedRow(selectedRowMessageBody);
  };

  // 将message_body转化为字符串，显示代码
  const formatObject = (obj: any, indent: number = 2): string => {
    if (!obj) return "";

    return `{
${Object.entries(obj)
  .map(([key, value]) => {
    const indentation = " ".repeat(indent);
    // 处理对象类型的值
    if (value && typeof value === "object") {
      return `${indentation}${key}: ${formatObject(value, indent + 2)}`;
    }
    // 处理字符串变量（不加引号）
    if (
      value &&
      typeof value === "string" &&
      (value.includes("Key") || value.includes("Time") || value.includes("Id"))
    ) {
      return `${indentation}${key}: ${value}`;
    }
    // 处理普通字符串（加引号）
    if (typeof value === "string") {
      return `${indentation}${key}: "${value}"`;
    }
    // 处理数字等其他类型
    return `${indentation}${key}: ${value}`;
  })
  .join(",\n")}\n${" ".repeat(indent - 2)}}`; // 最后的闭合括号缩进
  };
  const codeString = selectedRow ? formatObject(selectedRow) : "";

  const handleCopyToClipboard = () => {
    setCodeCopied(true);
    setTimeout(() => {
      setCodeCopied(false);
    }, 2000);
  };

  // Log File
  const handleExportLog = () => {
    if (messages) {
      const now = new Date();
      const timestamp = now
        .toLocaleString("zh-CN", {
          hour12: false,
          timeZone: "Asia/Shanghai",
        })
        .replace(/\//g, ".")
        .replace(/:/g, ".")
        .replace(/ /g, "-")
        .slice(0, 19);

      const fileName = `export-log-${timestamp}`;
      const logContent = messages
        .map((item) => {
          return formatObject(item.message_body);
        })
        .join("\n--------------------------------------------------\n");

      const blob = new Blob([logContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    }
  };

  const handleLogToFile = () => {
    socket?.emit("startLogging", logTofileMessages);
    console.log("Client sent startLogging with messages:", logTofileMessages);
    setIsLoggingToFile(true);
  };

  const handleStopLogToFile = () => {
    socket?.off("startLogging");
    socket?.off("LogToFile");
    setIsLoggingToFile(false);
    console.log("Client: Stopped logging messages");
  };

  return (
    <div>
      <div className="flex flex-col p-4 h-screen">
        {/* RMQ connection */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline">Protocol</Button>
          <ConnectRMQ
            isConnected={isConnected}
            handleConnect={handleConnect}
            handleDisconnect={handleDisconnect}
          />
        </div>

        {/* RMQ connection failed */}
        <div>
          <Toaster />
          <Separator />
        </div>

        {/* Message Filter */}
        <div className="flex gap-4 mb-4">
          <div className="flex flex-1 gap-4">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex items-center flex-1">
                <div className="flex items-center">
                  <Label htmlFor="messageFilter">Message Filter</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-4 h-8">
                        <CircleHelp className="text-primary/70" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Message Filter Example</DialogTitle>
                      </DialogHeader>
                      <div className="flex items-center space-x-2">
                        <div className="grid flex-1 gap-4">
                          <MessageExample
                            label={"Dev in c"}
                            content={"只显示 content_type 中包含 'Dev' 的消息"}
                          />
                          <MessageExample
                            label={"'ClientState' not in c"}
                            content={
                              "只显示 content_type #中不包含 'ClientState' 的消息"
                            }
                          />
                          <MessageExample
                            label={
                              "c == 'ClientRegMsg' and b.startsswith('001')"
                            }
                            content={
                              "只显示 content_type 为 'ClientRegMsg'，且消息体以 '001' 为开头的消息"
                            }
                          />
                          <MessageExample
                            label={"c == 'ClientRegMsg' and b.endswith('001')"}
                            content={
                              "只显示 content_type 为 'ClientRegMsg'，且消息体以 '001' 为结尾的消息"
                            }
                          />
                          <MessageExample
                            label={
                              "c == 'ClientRegMsg' and ('001' in b or '002' in b"
                            }
                            content={
                              "只显示 content_type 为 'ClientRegMsg'，且消息体中包含 '001' 或 '002' 的消息"
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Close
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex-1">
                  <MultipleSelector
                    defaultOptions={OPTIONS}
                    placeholder="Type your filter..."
                    creatable
                    hidePlaceholderWhenSelected
                    emptyIndicator={
                      <p className="text-center text-md leading-10 text-gray-600 dark:text-gray-400">
                        no results found.
                      </p>
                    }
                    onChange={handleOptionsChange}
                  />
                </div>
              </div>
              <div>
                <InputComponent
                  label="Max&nbsp;Items"
                  id="max-items"
                  type="number"
                  name="max-items"
                  onChange={handleMaxItemsChange}
                  value={filter.MaxItems}
                  required
                  className="max-w-24"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="bg-brand hover:bg-brand/90 min-w-[5.7rem]"
                onClick={handleApply}
                disabled={!isConnected || isApplied}
              >
                {isApplied ? <Loader2 className="animate-spin" /> : ""}
                Apply
              </Button>
              <Button
                variant="outline"
                onClick={isPaused ? handleContinue : handlePause}
                disabled={!isConnected || !isApplied}
                className={`${
                  isPaused
                    ? "bg-brand hover:bg-brand/90 text-white hover:text-white"
                    : ""
                }
                min-w-[5.6rem]`}
              >
                {isPaused ? "Continue" : "Pause"}
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={messages.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Message Display: List and Body */}
        <div className="flex flex-1 gap-2">
          <div className="container mx-auto">
            <DataTable
              columns={columns}
              data={messages}
              handleSelectedRow={handleSelectedRow}
              handleExportLog={handleExportLog}
              handleLogToFile={handleLogToFile}
              handleStopLogToFile={handleStopLogToFile}
              isLoggingToFile={isLoggingToFile}
              messages={messages}
              isConnected={isConnected}
            />
          </div>
          <div className="min-w-[calc(40%)] relative">
            <div className="absolute flex top-0 right-0 p-1">
              <CopyToClipboard text={codeString} onCopy={handleCopyToClipboard}>
                <Button variant={"ghost"}>
                  {selectedRow &&
                    (codeCopied ? (
                      "Copied!"
                    ) : (
                      <Clipboard className="text-primary" />
                    ))}
                </Button>
              </CopyToClipboard>
            </div>
            <SyntaxHighlighter
              language="json"
              style={atomOneLight}
              showLineNumbers={true}
              wrapLongLines={true}
              customStyle={{
                padding: "24px",
                borderRadius: `calc(var(--radius) - 2px)`,
                fontSize: "14px",
                height: "100%",
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
