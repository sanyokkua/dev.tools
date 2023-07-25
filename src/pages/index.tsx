import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import AppLayout from "@/components/app_layout";

export default function Home() {
    const content: JSX.Element = <>
        <p>
            Hello everyone! On this small web-app (that currently in development) you can find useful tools.
        </p>
        <p>
            First of all, here some shortcuts to sort lines, generate configs, format JSON and etc.
        </p>

        <br/>

        <div>
            Below you can find a list of tools that now are available:
            <ul>
                <li><b>String Utils</b> - Encode/Decode strings, remove duplicates, sort lines</li>
                <li><b>Json Utils</b> - Format Json, Compact Json</li>
                <li><b>Terminal Utils</b> - Join commands in one</li>
                <li><b>Git Setup</b> - Configure fresh installation of git</li>
                <li><b>Mac OS Setup</b> - Generate commands to install required apps in several clicks</li>
                <li><b>Windows Setup</b> - Generate commands to install required apps in several clicks</li>
            </ul>
        </div>

        <br/>

        <p>
            This is a pet project and new functionality will be adding when there are time for it. But even these tools
            can save a lot of time during setup new installations of OS or during development.
        </p>
    </>;

    return (
        <>
            <AppLayout breadcrumbItems={["Home"]} content={content}/>
        </>
    );
}
