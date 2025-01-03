# Thrice

## Project Structure

backend/
├── functions/ # Main source directory for Cloudflare Pages
│ ├── api/ # API routes directory
│ │ ├── [[route]].ts # Main API entry point
│ │ └── index.ts # Optional: Additional routes
│ ├── middleware/ # Custom middleware
│ │ ├── auth.ts # Authentication middleware
│ │ ├── error-handler.ts # Error handling middleware
│ │ └── validators.ts # Request validation middleware
│ ├── controllers/ # Route handlers
│ │ ├── user.controller.ts # User-related route handlers
│ │ └── game.controller.ts # Game-related route handlers
│ ├── services/ # Business logic layer
│ │ ├── user.service.ts # User-related business logic
│ │ └── game.service.ts # Game-related business logic
│ ├── models/ # Data models and interfaces
│ │ ├── user.model.ts # User-related interfaces
│ │ └── game.model.ts # Game-related interfaces
│ └── utils/ # Utility functions
│ ├── constants.ts # Constants and configuration
│ └── helpers.ts # Helper functions
├── public/ # Static files (if needed)
├── tests/ # Test files
│ ├── api.test.ts # API tests
│ └── services.test.ts # Service tests
├── .gitignore # Git ignore file
├── package.json # Project dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── wrangler.toml # Cloudflare configuration
└── README.md # Project documentation
