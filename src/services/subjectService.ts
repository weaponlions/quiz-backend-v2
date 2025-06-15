import { PrismaClient } from "@prisma/client";
import { QuestionTranslation, StatusCode, Subject } from "../types";  


export const createSubjectService = async (name: string) => {
    try {
        const prisma = new PrismaClient();

        if (name === "") {
            return {
                success: false,
                status: StatusCode.BAD_REQUEST,
                results: {} as Subject,
                message: "Request body must be a non-empty string"
            };
        }


        const newSubject : Subject = await prisma.subject.create({
            data: { name }
        });

        return (
            {
                success: true,
                status: StatusCode.OK,
                results: newSubject,
                message: "Save subject success"
            }
        );
    } catch (error) {
    console.error("Unexpected error in Subject service:", error);
        return {
            success: false,
            status: StatusCode.BAD_REQUEST,
            results: {} as Subject,
            message: "An unexpected error occurred"
        };
    }
};