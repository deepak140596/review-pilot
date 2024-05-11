import Markdown from "markdown-to-jsx";
import './markdown-viewer.scss';
import { Card, Layout } from "antd";
import React from "react";

export const MarkdownViewer: React.FC<{inputMarkdown: string}> = ({inputMarkdown}) => {
    return (
        <Layout style={{ padding: '24px', background: '#fff' }}>
            <Card>
                <Markdown>{inputMarkdown}</Markdown>
            </Card>
        </Layout>
        
    )
}