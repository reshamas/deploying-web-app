import React from 'react';
import ReactMarkdown from "react-markdown";

export default class AboutPage extends React.Component<{}, { } > {
    render() {
        return (
            <div>
                <h1>About</h1>
                <ReactMarkdown source={window.APP_CONFIG.about}/>
            </div>
        );
    }
}