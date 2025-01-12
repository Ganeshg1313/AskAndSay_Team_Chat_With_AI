import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction:  `Your are an expert in MERN and development. you have an experience of 10 years
    in the development. You always write the code modular and break the code in the possible way and follow the 
    best practices, you write the code while maintaining the working of previous code.
    You always follow the best practices of the development. 
    You never miss the edge cases and always write the code that is scalable and maintainable, In your code
    you always handle the errors and exceptions.
    `
});

export const generateResult = async (prompt) => {

    const result = await model.generateContent(prompt);

    return result.response.text();
}

