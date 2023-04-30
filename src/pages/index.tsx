import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import AppLayout from "@/components/app_layout";

export default function Home() {
    const content: JSX.Element = <h1>
        On this site you will find useful features/tools for developers.
        This site is in development, but you can use already String Tools.
    </h1>;

    return (
        <>
            <AppLayout breadcrumbItems={["Home"]} content={content}/>
        </>
    );
}
