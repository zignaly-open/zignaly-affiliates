<?php
$conn = pg_connect('postgresql://postgres:yielves@localhost:5432/postgres');
$result = pg_query($conn, '
    CREATE TABLE marketing.campaign_events (
        "event_id" SERIAL PRIMARY KEY,
        "track_id" character varying(4000),
        "insert_date" timestamp,
        "event_date" timestamp,
        "event_type" character varying(50),
        "payment_type" character varying(50),
        "user_id" character varying(50),
        "service_id" character varying(400),
        "affiliate_id" character varying(400),
        "campaign_id" character varying(400),
        "sub_track_id" character varying(400),
        "quantity" bigint,
        "amount" numeric(17,2),
        "allocated" numeric(21,2),
        "profit_sharing" boolean
    ) WITH (oids = false);
');


const COUNT = 10;

function valueOrNull($name, $index) {
    if(isset($_POST[$name][$index])) {
        return '\'' . str_replace('\'', '"', $_POST[$name][$index]) . '\'';
    } else return "NULL";
}

if(isset($_POST['event_type'])) {
    $clearDb = $_POST['clear'] === 'on';
    $all_sql = 'DELETE FROM marketing.campaign_events;';
    pg_query($conn, $all_sql);
    for($i = 0; $i < COUNT; $i++) {
        if($_POST['event_type'][$i]) {
            $sql = '
                INSERT INTO marketing.campaign_events
                ("track_id", "insert_date", "event_date", "event_type", "payment_type", "user_id", "service_id", "affiliate_id", "campaign_id", "sub_track_id", "quantity", "amount", "allocated", "profit_sharing") VALUES
                (' . valueOrNull('track_id', $i) . ', NOW(), \'' . $_POST['event_date'][$i] . ' 00:00:00.000\',
                ' . valueOrNull('event_type', $i) . ',
                ' . valueOrNull('payment_type', $i) . ',
                ' . valueOrNull('user_id', $i) . ',
                ' . valueOrNull('service_id', $i) . ',
                ' . valueOrNull('affiliate_id', $i) . ',
                ' . valueOrNull('campaign_id', $i) . ',
                ' . valueOrNull('sub_track_id', $i) . ',
                ' . valueOrNull('quantity', $i) . ',
                ' . valueOrNull('amount', $i) . ',
                ' . valueOrNull('allocated', $i) . ', ' . (isset($_POST['event_type'][$i]) && $_POST['event_type'][$i] === 'on' ? '\'t\'' : '\'f\'') . ');

            ';
            $all_sql .= $sql;
            pg_query($conn, $sql);
        }
    }

    $file = 'export_' . time() . '.sql';
    header("Content-Type: application/octet-stream");
    header("Content-Transfer-Encoding: Binary");
    header("Content-disposition: attachment; filename=\"{$file}\"");

    echo $all_sql;
    echo PHP_EOL;
    echo PHP_EOL;
    echo PHP_EOL;
    echo '-- ' . implode(PHP_EOL . '-- ', explode(PHP_EOL, shell_exec('cd /var/www/zignaly-affiliates/server && /usr/bin/node --es-module-specifier-resolution=node cron/events.js ' . ($clearDb ? 'clear' : '') . ' 2>&1')));
    file_put_contents(dirname(__FILE__) . '/dumps/' . $file, $all_sql);
    die();
}
?>


<h1>How to use</h1>

<p>Fill the data. Order does not matter, just note the dates. Since here the precision is 1 day, please do not set visit and connect to the exact same date.</p>
<p>The "Clear chains" flag will clear existing saved chains. If you do not set it, the new chains db will not be cleared, i.e. we'll get new conversions.</p>
<p>Once you perform the Save, a dump ith this data will be downloaded to your machine just in case</p>
<p>Affiliate id and service id needs to be filled manually. Sorry.</p>


<p></p>

<form method="post" action="">
<table>
<tr style="text-align: left">
    <th><br>Type</th>
    <th><br>Date</th>
    <th><br>Track Id</th>
    <th>Payment<br>Type</th>
    <th><br>User Id</th>
    <th><br>Service Id</th>
    <th><br><abbr style="color: #f00" title="Needs to match affiliate id on the Affiliate platform">Affiliate Id</abbr></th>
    <th><br><abbr style="color: #f00" title="Needs to match campaign id on the Affiliate platform">Campaign Id</abbr></th>
    <th><br>Subtrack</th>
    <th>Payment<br />Quantity</th>
    <th>Payment<br />Amount</th>
    <th><br>$ invested</th>
</tr>
<?php for($i = 0; $i < COUNT; $i++) : ?>
<tr>
    <td>
        <select name="event_type[<?= $i ?>]" onchange="disableStuff(this)">
            <option value=""</option>
            <option value="click">Click</option>
            <option value="identify">Identify</option>
            <option value="connect">Connect</option>
            <option value="payment">Payment</option>
        </select>
    </td>
    <td><input style="width: 140px" disabled type="date" name="event_date[<?= $i ?>]" placeholder="event date" /></td>
    <td><input style="width: 100px" disabled type="text" name="track_id[<?= $i ?>]" placeholder="track id" class="cell-track_id" /></td>
    <td>
        <select disabled name="payment_type[<?= $i ?>]" class="cell-payment_type">
            <option value="profitSharing">Profit Sharing</option>
            <option value="coinPayments">Coin Payment</option>
        </select>
    </td>

    <td><input style="width: 100px" disabled type="text" name="user_id[<?= $i ?>]" class="cell-user_id" placeholder="user id" /></td>
    <td><input style="width: 100px" disabled type="text" name="service_id[<?= $i ?>]" class="cell-service_id" placeholder="service id" /></td>
    <td><input style="width: 120px" disabled type="text" name="affiliate_id[<?= $i ?>]" class="cell-affiliate_id" placeholder="affiliate id" /></td>
    <td>
           <select disabled name="campaign_id[<?= $i ?>]" class="cell-campaign_id">
               <option value="608bc944ccfc467e844aebea">TESTING MERCHANT K Campaign 1</option>
               <option value="6094f81974d5353934a4483e">AFF TEST SPOT</option>
               <option value="609bbe664f91c653e6643f04">NEW CAMPAIGN</option>
               <option value="5fd3ab44f182a98d0c33c7c0">Campaign 1</option>
           </select>
    </td>
    <td><input style="width: 77px" disabled type="text" name="sub_track_id[<?= $i ?>]" class="cell-sub_track_id" placeholder="subtrack" /></td>
    <td><input style="width: 77px" disabled type="number" name="quantity[<?= $i ?>]" class="cell-quantity" placeholder="quantity" /></td>
    <td><input style="width: 77px" disabled type="number" step="0.01" name="amount[<?= $i ?>]" class="cell-amount" placeholder="amount" /></td>
    <td><input style="width: 77px" disabled type="number" step="0.01" name="allocated[<?= $i ?>]" class="cell-allocated" placeholder="allocated" /></td>
    <td><input type="checkbox" name="profitsharing[<?= $i ?>]" class="cell-profitsharing" /></td>
</tr>
<?php endfor; ?>
</table>

<label>
    <input type="checkbox" name="clear"> Clear Chains
</label>

<br />
<br />

<button type="submit">Save</button>
</form>


<script type="text/javascript">
function disableStuff(element) {
    var tr = element.parentNode.parentNode;
    [...tr.querySelectorAll('input, select')].forEach(x => x.disabled = false);
    if(element.value === 'click'){
        [...tr.querySelectorAll('.cell-payment_type, .cell-user_id, .cell-service_id, .cell-profitsharing, .cell-quantity, .cell-amount, .cell-allocated')].forEach(x => x.disabled = true);
    } else
    if(element.value === 'identify'){
        [...tr.querySelectorAll('.cell-payment_type, .cell-service_id, .cell-affiliate_id, .cell-profitsharing, .cell-campaign_id, .cell-sub_track_id, .cell-quantity, .cell-amount, .cell-allocated')].forEach(x => x.disabled = true);
    } else
    if(element.value === 'connect'){
        [...tr.querySelectorAll('.cell-payment_type, .cell-track_id, .cell-affiliate_id, .cell-campaign_id, .cell-sub_track_id, .cell-quantity, .cell-amount')].forEach(x => x.disabled = true);
    } else
    if(element.value === 'payment'){
        [...tr.querySelectorAll('.cell-track_id, .cell-affiliate_id, .cell-campaign_id, .cell-profitsharing, .cell-sub_track_id, .cell-allocated')].forEach(x => x.disabled = true);
    }
}
</script>
