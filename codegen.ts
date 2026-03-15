
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
	overwrite: true,
	schema: "./src/schemas/**/*.graphql",
	generates: {
		"./src/lib/types/generated.types.ts": {
			plugins: ["typescript", "typescript-resolvers"]
		},
		"./graphql.schema.json": {
			plugins: ["introspection"]
		}
	}
};

export default config;
