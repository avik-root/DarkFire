export default function PrivacyPage({}: {}) {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl md:text-5xl font-headline tracking-tighter">Privacy <span className="text-primary">Policy</span></h1>
      <div className="max-w-4xl mx-auto text-foreground/80 space-y-6">
        <p className="text-sm text-muted-foreground">Last updated: June 24, 2024</p>
        
        <div>
            <h2 className="text-2xl font-headline text-primary mt-8 mb-2">1. Introduction</h2>
            <p>Welcome to DarkFire. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using DarkFire, you agree to the collection and use of information in accordance with this policy.</p>
        </div>
        
        <div>
            <h2 className="text-2xl font-headline text-primary mt-8 mb-2">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, which you voluntarily provide to us when you register with the application. You are under no obligation to provide us with personal information of any kind, however your refusal to do so may prevent you from using certain features of the Service.</li>
              <li><strong>Generated Data:</strong> We may temporarily process the specifications you provide for code generation to create the output. We do not permanently store the specifications or the resulting generated code associated with your account after your session ends.</li>
            </ul>
        </div>

        <div>
            <h2 className="text-2xl font-headline text-primary mt-8 mb-2">3. Use of Your Information</h2>
            <p>Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Create and manage your account.</li>
              <li>Email you regarding your account or order.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
              <li>Ensure the ethical and responsible use of our AI tools.</li>
            </ul>
        </div>
        
        <div>
            <h2 className="text-2xl font-headline text-primary mt-8 mb-2">4. Disclosure of Your Information</h2>
            <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information. This does not include trusted third parties who assist us in operating our application, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>
        </div>

        <div>
            <h2 className="text-2xl font-headline text-primary mt-8 mb-2">5. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
        </div>

        <div>
            <h2 className="text-2xl font-headline text-primary mt-8 mb-2">6. Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:contact@darkfire.dev" className="text-primary hover:underline">contact@darkfire.dev</a></p>
        </div>
      </div>
    </div>
  );
}
