import { MarkdownViewer } from "../../components/markdown-viewer/markdown-viewer"

export const PrivacyPolicy = () => {
    return (
        <MarkdownViewer inputMarkdown={privacyPolicyInMarkdown}/>
        
    )
}


const privacyPolicyInMarkdown: string = `
# Privacy Policy

## Introduction
Welcome to ReviewPilot! We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our software.

## Information Collection

### Types of Information Collected
- **Personal Information**: We collect your GitHub username, email address, and any other information you choose to provide.
- **Non-Personal Information**: We collect data such as browser type, IP address, and usage statistics.

### Methods of Collection
- **GitHub Login**: Information is collected when you log in through GitHub.
- **Cookies and Analytics**: We use cookies and analytics tools to gather data on usage patterns.

## Use of Information

### Purpose of Use
- **Service Provision**: To automate and improve the reviewing of pull requests on GitHub.
- **User Support**: To provide customer support and respond to inquiries.
- **Enhancements**: To improve and personalize the user experience.

### Third-Party Sharing
- **Service Providers**: Information may be shared with third-party service providers to facilitate our services (e.g., hosting, analytics).
- **Compliance**: Information may be disclosed to comply with legal obligations.

## Cookies and Tracking Technologies

### Use of Cookies
- **Session Cookies**: To keep you logged in during your session.
- **Analytics Cookies**: To understand how you use ReviewPilot and improve our service.

### Tracking Technologies
- **Beacons and Pixels**: Used to track user behavior on our site.

## Data Protection

### Security Measures
- **Encryption**: We use encryption to protect data transmitted to and from our site.
- **Access Controls**: We implement access controls to restrict who can access personal information.

### Data Retention
- **Retention Period**: We retain your personal data only as long as necessary to provide our services or as required by law.

## User Rights

### Access and Correction
- **Right to Access**: You can request a copy of the personal data we hold about you.
- **Right to Correct**: You can request corrections to your personal data.

### Deletion and Restriction
- **Right to Delete**: You can request the deletion of your personal data.
- **Right to Restrict**: You can request restrictions on the processing of your data.

### Data Portability
- **Right to Portability**: You can request your personal data in a structured, commonly used, and machine-readable format.

## Children’s Privacy
- **No Collection from Minors**: We do not knowingly collect data from children under 13. If you believe we have collected such data, please contact us to remove it.

## Policy Changes

### Notification of Changes
- **Updates**: We will notify users of significant changes to this policy via email or a prominent notice on our site.
- **Effective Date**: This policy is effective as of 11th May, 2024.

## Contact Information

### Inquiries and Complaints
- **Email**: support@gaintrack.in
- **Address**: CP Nagar, Kalipahari, Maithon, Dhanbad, Jharkhand, India

If you have any questions or concerns about this Privacy Policy, please contact us.

---

By using ReviewPilot, you agree to the terms of this Privacy Policy.

`
