import PG from 'pg';
import dotenv from 'dotenv';
import { logError } from './logger';

dotenv.config();

const client = new PG.Client({
  connectionString: process.env.PG_CONNECTION,
});

async function loadNewChains(lastPaymentTime) {
  const updatedChains = [];
  try {
    await client.connect();
    const { rows: uniqueClients } = await client.query(
      `
      SELECT client.*, client.date - interval '30 days' as click_min_date, connect.event_date as connect_date FROM (
        SELECT user_id, service_id, MIN(event_date) as date
        FROM marketing.campaign_events
        WHERE event_type = 'payment'
        GROUP BY user_id, service_id
        ${lastPaymentTime ? 'HAVING MAX(event_date) > $1' : ''}
      ) client
      INNER JOIN marketing.campaign_events connect
        ON client.user_id = connect.user_id
        AND client.service_id = connect.service_id
        AND connect.event_date < client.date
        AND connect.event_type = 'connect'
    `,
      lastPaymentTime ? [lastPaymentTime] : [],
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
        [c.click_min_date, c.date, c.user_id],
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
        updatedChains.push({ visit, payments });
      }
    }
    await client.end();
  } catch (error) {
    logError(error);
  }

  return updatedChains;
}

export default loadNewChains;
