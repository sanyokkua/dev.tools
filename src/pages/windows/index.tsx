import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import AppLayout from "@/components/app_layout";

export default function WindowsSetupPage() {
    return (
        <>
            <AppLayout breadcrumbItems={["Home", "windows"]} content={<div>Windows Setup Page</div>}/>
        </>
    );
}

