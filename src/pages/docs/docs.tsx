import { Card, Layout } from "antd"

export const Docs = () => {
    return (
        <Layout style={{ padding: '24px', background: '#fff' }}>
            <Card>
                <h1>Docs [In Progress]</h1>
                <p>Welcome to the ReviewPilot documentation! Here you'll find everything you need to know about our platform and how to get started.</p>
                <h2>Getting Started</h2>
                <p>ReviewPilot is an AI-powered code review tool that helps streamline the code review process. To get started, follow these steps:</p>
                <ol>
                    <li>Sign up for a ReviewPilot account.</li>
                    <li>Connect your GitHub account to ReviewPilot.</li>
                    <li>Create a new repository or select an existing one for code review.</li>
                    <li>Start a new code review and let ReviewPilot do the rest!</li>
                </ol>
                <h2>Features</h2>
                <p>ReviewPilot offers a range of features to enhance your code review experience:</p>
                <ul>
                    <li>Automated code reviews using advanced AI technology.</li>
                    <li>Integration with GitHub for a seamless workflow.</li>
                    <li>Insightful feedback to improve code quality and maintain best practices.</li>
                </ul>
            </Card>
        </Layout>
    )
}