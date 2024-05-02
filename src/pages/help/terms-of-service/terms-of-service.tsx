import Markdown from "markdown-to-jsx";

export const TermsOfService = () => {
    return (
        <div className="terms-of-service">
            <Markdown>{termsOfServiceInMarkdown}</Markdown>
        </div>
    )
}

const termsOfServiceInMarkdown: string = `
# Terms of Service

These terms of service ("Terms") are a legal agreement between you and Company Name. Please read them carefully.

## 1. Introduction

By using our website, you agree to these Terms. If you do not agree to these Terms, you must not use our website.

## 2. Changes to Terms

We may update these Terms from time to time. If we do, we will let you know by posting the updated Terms on our website. It is your responsibility to check our website for updates.

## 3. Changes to Our Website

We may update our website from time to time. We do not guarantee that our website, or any content on it, will be free from errors or omissions.

## 4. Changes to Our Services

We may update our services from time to time. We do not guarantee that our services will be available at all times.

## 5. Limitation of Liability

We will not be liable to you for any loss or damage, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, even if foreseeable, arising under or in connection with:

- use of, or inability to use, our website; or

- use of, or reliance on, any content displayed on our website.

## 6. Governing Law

These Terms are governed by the laws of the United States of America.

## 7. Contact Us

If you have any questions about these Terms, please contact us.
`
