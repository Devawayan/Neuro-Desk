import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

interface TranscriptMessage {
    role: "user" | "assistant";
    text: string;
};

export const useVapi = () => {
    const [ vapi, setVapi ] = useState<Vapi | null>(null);
    const [ isConnected, setIsConnected ] = useState(false);
    const [ isConnecting, setIsConnecting ] = useState(false);
    const [ isSpeaking, setIsSpeaking ] = useState(false);
    const [ transcript, setTranscript ] = useState<TranscriptMessage[]>([]);

    useEffect(() => {
        const vapiInstance = new Vapi("fef4ede7-5c06-47e0-b67e-cc95b490fba2");
        setVapi(vapiInstance);

        vapiInstance.on("call-start", () => {
            setIsConnected(true);
            setIsConnecting(false);
            setTranscript([]);
        });

        vapiInstance.on("call-end", () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsSpeaking(false);
        });

        vapiInstance.on("speech-start", () => {
            setIsSpeaking(true);
        });

        vapiInstance.on("speech-end", () => {
            setIsSpeaking(false);
        });

        vapiInstance.on("error", (error) => {
            console.log(error, "VAPI_ERROR");
            setIsConnecting(false);
        });

        vapiInstance.on("message", (message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                setTranscript((prev) => [
                    ...prev,
                    {
                        role: message.role === "user" ? "user" : "assistant",
                        text: message.transcript,
                    }
                ]);
            }
        });

        return () => {
            vapiInstance?.stop();
        }
    }, []);

    const startCall = () => {
        setIsConnecting(true);

        if (vapi) {
            vapi.start("23504960-69b9-4ace-b788-3746ce0226b2");
        }
    }

    const endCall = () => {
        if (vapi) {
            vapi.stop();
        }
    };

    return {
        isSpeaking,
        isConnected,
        isConnecting,
        transcript,
        startCall,
        endCall,
    }
};