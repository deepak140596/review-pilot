import Markdown from "markdown-to-jsx";
import './markdown-viewer.scss';
import { Col, Row } from "antd";
import React from "react";

export const MarkdownViewer: React.FC<{inputMarkdown: string}> = ({inputMarkdown}) => {
    return (
        <Row>
            <Col span={24}>
                <div className="markdown-viewer">
                    <Markdown>{inputMarkdown}</Markdown>
                </div>
            </Col>
        </Row>
        
    )
}