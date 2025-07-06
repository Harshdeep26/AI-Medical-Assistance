import { OpenAI } from "openai";
// This file is used to configure the OpenAI API client.
export const openai =new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPEN_ROUTER_API_KEY,
});