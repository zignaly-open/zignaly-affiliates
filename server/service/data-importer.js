import PG from 'pg';
import dotenv from 'dotenv';
import { logError } from './logger';

dotenv.config();

const client = new PG.Client({
  connectionString: process.env.PG_CONNECTION,
});

export const connect = () => client.connect();
export const disconnect = () => client.end();

export async function loadChainsAndVisits() {
  const visits = await loadVisits();
  const chains = await loadChains();
  return {
    visits,
    chains,
  };
}

async function loadChains() {
  const updatedChains = [];
  try {
    const { rows: uniqueClients } = await client.query(
      `
        SELECT connect.user_id, connect.service_id, connect.event_date - interval '30 days' as click_min_date, connect.event_date as connect_date
        FROM marketing.campaign_events connect
        WHERE connect.event_type = 'connect'
    `,
      [],
    );

    for (const c of uniqueClients) {
      const {
        rows: [visit],
      } = await client.query(
        `
        SELECT visit.*
        FROM marketing.campaign_events visit
        WHERE
          event_type = 'click'
          AND event_date BETWEEN $1 AND $2
          AND track_id IN (
            SELECT track_id
            FROM marketing.campaign_events
            WHERE event_type = 'identify' AND track_id IS NOT NULL AND user_id = $3
            GROUP BY track_id
          )
        ORDER BY event_date DESC
        LIMIT 1
    `,
        [c.click_min_date, c.connect_date, c.user_id],
      );

      if (visit) {
        const { rows: payments } = await client.query(
          `
          SELECT *
          FROM marketing.campaign_events
          WHERE service_id = $1 AND user_id = $2 AND event_type = 'payment'
          ORDER BY event_date ASC
        `,
          [c.service_id, c.user_id],
        );
        updatedChains.push({
          visit,
          payments,
          connectDate: c.connect_date,
          userId: c.user_id,
          serviceId: c.service_id,
        });
      }
    }
  } catch (error) {
    logError(error);
  }

  return updatedChains;
}

async function loadVisits() {
  const { rows } = await client.query(
    `
      SELECT
        MAX(visit.event_id) as event_id,
        MAX(visit.event_date) as event_date,
        MAX(visit.sub_track_id) as sub_track_id,
        MAX(visit.campaign_id) as campaign_id,
        MAX(visit.affiliate_id) as affiliate_id,
        MAX(identify.user_id) as user_id
      FROM marketing.campaign_events visit
      LEFT JOIN (
        SELECT identify.track_id, MAX(identify.user_id) as user_id, MAX(click.event_id) as click_event_id
        FROM marketing.campaign_events identify
        INNER JOIN marketing.campaign_events click ON click.track_id = identify.track_id AND click.event_type = 'click'
        WHERE identify.user_id <> '' AND identify.event_type = 'identify'
        GROUP BY identify.track_id
      ) identify ON
        identify.click_event_id = visit.event_id
      WHERE visit.event_type = 'click' AND campaign_id <> '' AND affiliate_id <> ''
      GROUP BY visit.track_id
  `,
    [],
  );
  return rows;
}

export async function loadCustomerData() {
  const { rows } = await client.query(
    `
      SELECT user_id, SUM(allocated) as allocated, MIN(event_date) as first_connect_date
      FROM marketing.campaign_events
      WHERE event_type = 'connect'
      GROUP BY user_id
  `,
    [],
  );
  return rows.reduce(
    (memo, current) => ({
      ...memo,
      [current.user_id]: {
        firstConnectDate: current.first_connect_date,
        moneyInvested: Number(current.allocated),
      },
    }),
    {},
  );
}
