'use strict';

module.exports = {
  pre: function () {
    return new Promise((resolve, reject) => {
      this.models['core_store'] = {
        connection: 'default',
        info: {
          name: 'core_store',
          description: ''
        },
        attributes: {
          key: {
            type: 'string'
          },
          value: {
            type: 'string'
          },
          type: {
            type: 'string'
          },
          environment: {
            type: 'string'
          }
        },
        globalId: 'StrapiConfigs',
        collectionName: 'core_store'
      };

      this.store = (source = {}) => {
        const get = async (params = {}) => {
          const configs = Object.assign(source, params);

          const {
            key,
            environment = strapi.config.environment,
            type = 'core',
            name = ''
          } = configs;

          const prefix = `${type}${name ? `_${name}` : ''}`;

          const findAction = strapi.models['core_store'].orm === 'mongoose' ? 'findOne' : 'forge';

          const where = {
            key: `${prefix}_${key}`,
            environment
          };

          let data = strapi.models['core_store'].orm === 'mongoose'
          ? await strapi.models['core_store'].findOne(where)
          : await strapi.models['core_store'].forge(where).fetch().then(configs => configs.toJSON());

          if (!data) {
            return null;
          }

          if (data.type === 'object' || data.type === 'array' || data.type === 'boolean') {
            try {
              return JSON.parse(data.value);
            } catch (err) {
              return new Date(data.value);
            }
          } else if (data.type === 'number') {
            return parseFloat(data.value);
          } else {
            return null;
          }
        };

        const set = async (params = {}) => {
          const configs = Object.assign(source, params);

          const {
            key,
            value,
            environment = strapi.config.environment,
            type,
            name
          } = configs;

          const prefix = `${type}${name ? `_${name}` : ''}`;

          const where = {
            key: `${prefix}_${key}`,
            environment
          };

          let data = strapi.models['core_store'].orm === 'mongoose'
          ? await strapi.models['core_store'].findOne(where)
          : await strapi.models['core_store'].forge(where).fetch().then(configs => configs.toJSON());

          if (data) {
            data = Object.assign(data, {
              value: JSON.stringify(value) || value.toString(),
              type: (typeof value).toString()
            });

            strapi.models['core_store'].orm === 'mongoose'
            ? await strapi.models['core_store'].update({ _id: data._id }, data, { strict: false })
            : await strapi.models['core_store'].forge({ id: data.id }).save(data, { patch: true });
          } else {
            data = Object.assign(where, {
              value: JSON.stringify(value) || value.toString(),
              type: (typeof value).toString()
            });

            strapi.models['core_store'].orm === 'mongoose'
            ? await strapi.models['core_store'].create(data)
            : await strapi.models['core_store'].forge().save(data);
          }
        };

        return {
          get,
          set
        }
      }

      resolve();
    });
  },
  post: function () {
    return new Promise(async (resolve, reject) => {
      const Model = this.models['core_store'];

      if (Model.orm !== 'bookshelf') {
        return resolve();
      }

      const hasTable = await this.connections[Model.connection].schema.hasTable(Model.tableName || Model.collectionName);

      if (!hasTable) {
        const quote = Model.client === 'pg' ? '"' : '`';

        console.log(`
⚠️  TABLE \`core_store\` DOESN'T EXIST

CREATE TABLE ${quote}${Model.tableName || Model.collectionName}${quote} (
  id ${Model.client === 'pg' ? 'SERIAL' : 'INT AUTO_INCREMENT'} NOT NULL PRIMARY KEY,
  key text,
  value text,
  environment text,
  type text
);
        `);

        // Stop the server.
        return this.stop();
      }

      resolve();
    });
  }
};
