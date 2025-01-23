jest.setTimeout(10000); // 10 seconds timeout for setup

beforeAll(async () => {
  const script = document.createElement('script');
  script.src = "https://forms-flow-microfrontends.aot-technologies.com/forms-flow-components@v7.1.0-alpha/forms-flow-components.gz.js"; // URL from environment variable
  script.async = true;
  document.body.appendChild(script);

  await new Promise((resolve) => {
    script.onload = resolve;
  });
});
  
  