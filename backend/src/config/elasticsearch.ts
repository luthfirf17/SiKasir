import { Client } from '@elastic/elasticsearch';
import { config } from './index';

// Elasticsearch client configuration
export const elasticsearchClient = new Client({
  node: config.elasticsearch.url,
  auth: config.elasticsearch.username ? {
    username: config.elasticsearch.username,
    password: config.elasticsearch.password,
  } : undefined,
  requestTimeout: 60000,
  pingTimeout: 3000,
  tls: {
    rejectUnauthorized: false, // For development/self-signed certificates
  },
});

// Initialize Elasticsearch
export const initializeElasticsearch = async () => {
  try {
    console.log('🔍 Connecting to Elasticsearch...');
    
    // Test connection
    const health = await elasticsearchClient.cluster.health();
    console.log(`✅ Elasticsearch cluster status: ${health.status}`);
    
    // Create indices if they don't exist
    await createIndices();
    
    console.log('✅ Elasticsearch initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Elasticsearch connection failed:', error);
    console.log('📝 Note: Elasticsearch is optional. The application will continue without search features.');
    return false;
  }
};

// Create Elasticsearch indices using dynamic approach
const createIndices = async () => {
  const indices = [
    'kasir-menus',
    'kasir-customers',
    'kasir-orders',
    'kasir-inventory',
    'kasir-feedback'
  ];

  for (const index of indices) {
    try {
      const exists = await elasticsearchClient.indices.exists({ index });
      
      if (!exists) {
        // Create index with dynamic mapping
        await elasticsearchClient.indices.create({
          index,
          settings: {
            number_of_shards: 1,
            number_of_replicas: 0,
            analysis: {
              analyzer: {
                simple_analyzer: {
                  type: 'simple'
                }
              }
            }
          }
        });
        console.log(`✅ Created index: ${index}`);
      } else {
        console.log(`📋 Index already exists: ${index}`);
      }
    } catch (error) {
      console.error(`❌ Error creating index ${index}:`, error);
    }
  }
};

// Elasticsearch service class with simplified methods
export class ElasticsearchService {
  // Initialize service
  static async initialize() {
    return await initializeElasticsearch();
  }

  // Generic search method
  static async search(index: string, searchParams: any) {
    try {
      const response = await elasticsearchClient.search({
        index,
        ...searchParams
      });

      return {
        hits: response.hits.hits.map((hit: any) => ({
          ...hit._source,
          id: hit._id,
          score: hit._score
        })),
        total: typeof response.hits.total === 'object' ? response.hits.total.value : response.hits.total,
        took: response.took
      };
    } catch (error) {
      console.error(`Error searching in ${index}:`, error);
      return { hits: [], total: 0, took: 0 };
    }
  }

  // Menu search
  static async searchMenus(query: string, filters: any = {}) {
    const searchParams: any = {
      size: filters.limit || 20,
      from: filters.offset || 0
    };

    if (query) {
      searchParams.q = `name:${query}* OR description:${query}* OR category:${query}*`;
    }

    return await this.search('kasir-menus', searchParams);
  }

  // Customer search
  static async searchCustomers(query: string, filters: any = {}) {
    const searchParams: any = {
      size: filters.limit || 20,
      from: filters.offset || 0
    };

    if (query) {
      searchParams.q = `name:${query}* OR email:${query}* OR phone:${query}*`;
    }

    return await this.search('kasir-customers', searchParams);
  }

  // Order search
  static async searchOrders(query: string, filters: any = {}) {
    const searchParams: any = {
      size: filters.limit || 20,
      from: filters.offset || 0,
      sort: 'createdAt:desc'
    };

    if (query) {
      searchParams.q = `orderNumber:${query}* OR customerName:${query}*`;
    }

    return await this.search('kasir-orders', searchParams);
  }

  // Index document
  static async indexDocument(index: string, id: string, document: any) {
    try {
      await elasticsearchClient.index({
        index,
        id,
        document
      });
    } catch (error) {
      console.error(`Error indexing document to ${index}:`, error);
    }
  }

  // Update document
  static async updateDocument(index: string, id: string, updates: any) {
    try {
      await elasticsearchClient.update({
        index,
        id,
        doc: updates
      });
    } catch (error) {
      console.error(`Error updating document in ${index}:`, error);
    }
  }

  // Delete document
  static async deleteDocument(index: string, id: string) {
    try {
      await elasticsearchClient.delete({
        index,
        id
      });
    } catch (error) {
      console.error(`Error deleting document from ${index}:`, error);
    }
  }

  // Convenient methods for specific entities
  static async indexMenu(menu: any) {
    return await this.indexDocument('kasir-menus', menu.id, menu);
  }

  static async updateMenu(id: string, updates: any) {
    return await this.updateDocument('kasir-menus', id, updates);
  }

  static async deleteMenu(id: string) {
    return await this.deleteDocument('kasir-menus', id);
  }

  static async indexCustomer(customer: any) {
    return await this.indexDocument('kasir-customers', customer.id, customer);
  }

  static async updateCustomer(id: string, updates: any) {
    return await this.updateDocument('kasir-customers', id, updates);
  }

  static async deleteCustomer(id: string) {
    return await this.deleteDocument('kasir-customers', id);
  }

  static async indexOrder(order: any) {
    return await this.indexDocument('kasir-orders', order.id, order);
  }

  static async updateOrder(id: string, updates: any) {
    return await this.updateDocument('kasir-orders', id, updates);
  }

  static async deleteOrder(id: string) {
    return await this.deleteDocument('kasir-orders', id);
  }

  // Basic count and stats
  static async getDocumentCount(index: string) {
    try {
      const response = await elasticsearchClient.count({ index });
      return response.count;
    } catch (error) {
      console.error(`Error getting count for ${index}:`, error);
      return 0;
    }
  }

  // Check if service is available
  static async isAvailable() {
    try {
      await elasticsearchClient.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Close Elasticsearch connection
export const closeElasticsearchConnection = async () => {
  try {
    await elasticsearchClient.close();
    console.log('✅ Elasticsearch connection closed successfully');
  } catch (error) {
    console.error('❌ Error closing Elasticsearch connection:', error);
  }
};

// Export for backward compatibility
export { initializeElasticsearch as initializeDatabase };
