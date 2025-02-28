import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ConnectSelector from "../connect-selector";

type ConnectRMQProps = {
  isConnected: boolean;
  handleConnect: ({
    host,
    exchange,
    binding,
  }: {
    host: string;
    exchange: string;
    binding: string;
  }) => void;
  handleDisconnect: () => void;
};

const ConnectRMQ = ({
  isConnected,
  handleConnect,
  handleDisconnect,
}: ConnectRMQProps) => {
  const [hostOptions, setHostOptions] = useState([
    {
      value: "127.0.0.1",
      label: "127.0.0.1",
    },
  ]);

  const [exchangeOptions, setExchangeOptions] = useState([
    {
      value: "amq.topic",
      label: "amq.topic",
    },
  ]);

  const [bindingOptions, setBindingOptions] = useState([
    {
      value: "#",
      label: "#",
    },
  ]);

  const [hostValue, setHostValue] = useState(hostOptions[0].value);
  const [exchangeValue, setExchangeValue] = useState(exchangeOptions[0].value);

  const [bindingValue, setBindingValue] = useState(bindingOptions[0].value);

  const handleConnectClick = () => {
    handleConnect({
      host: hostValue,
      exchange: exchangeValue,
      binding: bindingValue,
    });
  };
  return (
    <div className="flex-1">
      <div className="flex flex-1 items-center justify-between gap-4">
        <ConnectSelector
          conditionName="Host"
          id="host"
          options={hostOptions}
          onOptionsChange={setHostOptions}
          value={hostValue}
          onValueChange={setHostValue}
        />
        <ConnectSelector
          conditionName="Exchange"
          id="exchange"
          options={exchangeOptions}
          onOptionsChange={setExchangeOptions}
          value={exchangeValue}
          onValueChange={setExchangeValue}
        />
        <ConnectSelector
          conditionName="Binding"
          id="binding"
          options={bindingOptions}
          onOptionsChange={setBindingOptions}
          value={bindingValue}
          onValueChange={setBindingValue}
        />
        <Button
          className={`
            ${
              isConnected
                ? "bg-red-500 hover:bg-red/90"
                : "bg-brand hover:bg-brand/90"
            }
            min-w-[6.3rem]
          `}
          onClick={isConnected ? handleDisconnect : handleConnectClick}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
    </div>
  );
};

export default ConnectRMQ;
