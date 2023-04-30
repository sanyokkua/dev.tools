import React from "react";
import AppLayout from "@/components/app_layout";

export default function JsonPage() {
    return (
        <>
            <AppLayout breadcrumbItems={["Home", "Json"]} content={<div>Json Page</div>}/>
        </>

    );
}
