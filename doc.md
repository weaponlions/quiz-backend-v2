npm init --y

npx tsc --init


{
  "compilerOptions": {
    "target": "ES2020", // Choose an appropriate ES version
    "module": "CommonJS", // CommonJS for Node.js
    "strict": true, // Enforce strict typing
    "esModuleInterop": true, // Enable importing ES modules
    "skipLibCheck": true, // Skip type checking of declaration files
    "forceConsistentCasingInFileNames": true, // Ensure consistent file naming
    "outDir": "./dist", // Output directory for compiled files
    "rootDir": "./src", // Root directory for source files
    "resolveJsonModule": true // Allow importing JSON files
  },
  "include": [
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}


npm install eslint --save-dev
npm install eslint-config-airbnb-base eslint-plugin-import --save-dev
npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev


mkdir src
