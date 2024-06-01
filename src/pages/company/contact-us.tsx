import React from 'react';
import { Form, Input, Button, Layout, Typography, Card, notification } from 'antd';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;

export const ContactUs: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; subject: string; message: string }) => {
    console.log('Received values:', values);
    form.resetFields();
  };

  return (
    <Layout style={{ padding: '24px', background: '#fff', display: 'flex', justifyContent: 'center' }}>
      <Content style={{ maxWidth: '600px', width: '100%' }}>
        <Card>
          <Title level={2}>Contact Us</Title>
          <Paragraph>
            If you have any questions, suggestions, or need support, please feel free to reach out to us using the form below.
          </Paragraph>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter your email', type: 'email' }]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item
              name="subject"
              label="Subject"
              rules={[{ required: true, message: 'Please enter the subject' }]}
            >
              <Input placeholder="Enter the subject" />
            </Form.Item>
            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: 'Please enter your message' }]}
            >
              <TextArea rows={4} placeholder="Enter your message" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Send Message
              </Button>
            </Form.Item>
          </Form>

            <Paragraph>
                Alternatively, you can email us at <a href="mailto:support@gaintrack.in">support@gaintrack.in</a>
            </Paragraph>

            <Paragraph>
                Our address is: CP Nagar, Kalipahari, Maithon, Dhanbad, Jharkhand, India
            </Paragraph>
        </Card>
      </Content>
    </Layout>
  );
};
