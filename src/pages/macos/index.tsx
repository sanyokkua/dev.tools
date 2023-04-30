import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import AppLayout from "@/components/app_layout";

export default function MacOSSetupPage() {
    return (
        <>
            <AppLayout breadcrumbItems={["Home", "macos"]} content={<div>MacOS Setup Page</div>}/>
        </>
    );
}
