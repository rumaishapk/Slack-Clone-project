import { useState,useEffect } from "react";
import {StreamChat} from "stream-chat";
import {useUser} from "@clerk/clerk-react"
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import * as Sentry from "@sentry/react";


const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;


export const useStreamChat =() => {
    const {user} = useUser()
    const [chatClient,setChatClient] = useState(null)


    const {data:tokenData, isLoading:tokenLoading, error:tokenError} = useQuery({
        queryKey :["streamToken"],
        queryFn: getStreamToken ,
        enabled: !! user?.id
    })

} 