import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import NavigationBar from "@/components/navigation";
import {Container} from "react-bootstrap";

export default function Home() {
    return (
        <>
            <NavigationBar/>
            <br/>
            <Container>
                <h1>
                    On this site you will find useful features/tools for developers.
                    This site is in development, but you can use already String Tools.
                </h1>
            </Container>
        </>
    );
}
