const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:Marketing@plugsales2026!@localhost:5432/plug_sales_dispatch_app'
});

async function createTestSubmission() {
  await client.connect();
  console.log('Connected to database');

  const ads = [
    {
      ad_name: "Ad 1: Premium Card",
      template_type: "imagem",
      media_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000",
      ad_copy: "This is a premium ad message for testing the new control center layout.",
      variables: ["NOME_CLIENTE", "DATA_ENTREGA"],
      button_link: "https://plugsales.com.br",
      spreadsheet_url: "https://example.com/sheet1.xlsx",
      message_mode: "manual"
    },
    {
      ad_name: "Ad 2: Video Tab",
      template_type: "video",
      media_url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
      ad_copy: "Testing the second tab with a video template. This should look great in the browser.",
      variables: ["UNIDADE", "PROMO"],
      button_link: "https://plugsales.com.br/promo",
      message_mode: "upload"
    }
  ];

  const query = `
    INSERT INTO client_submissions 
    (profile_name, ddd, status, ads, timestamp)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id;
  `;

  const values = ['CONTROL CENTER TEST', '11', 'PENDENTE', JSON.stringify(ads)];

  const res = await client.query(query, values);
  console.log('Inserted submission with ID:', res.rows[0].id);

  await client.end();
}

createTestSubmission().catch(err => {
  console.error(err);
  process.exit(1);
});
