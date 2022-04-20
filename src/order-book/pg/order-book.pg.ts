import { Pool } from 'pg';

async function pre() {
    const pool = new Pool({ user: 'postgres', password: 'postgres' });

    await pool.query(`--sql
        drop database if exists ku;
    `);
    await pool.query(`--sql
        create database ku;
    `);
    await pool.end();

    return new Pool({ user: 'postgres', password: 'postgres', database: 'ku' });
}

type TableName = 'asks' | 'bids';

function createTableQuery(name: TableName) {
    return `--sql
        create table ${name} (
            _symbol varchar(16),
            _price float,
            _amount float,
            _sequence bigint,
            _price_str varchar(20),
            _amount_str varchar(20),
            _id serial primary key
        );
    `;
}

function addInexSymbolPriceQuery(name: TableName) {
    return `--sql
        create index ${name}_symbol_price_idx on ${name} (_symbol, _price);
    `;
}

function gepsertFnQuery(name: TableName) {
    return `--sql
        create function gepsert_${name}(
            input_symbol varchar(16),
            input_price varchar(20),
            input_amount varchar(20),
            input_sequence varchar(20),
            input_best_limit integer
        ) returns table(
            type varchar(5),
            symbol varchar(16),
            price varchar(20),
            amount varchar(20)
        ) language plpgsql as $FUNCTION$
            begin
                if (
                    select true
                    from ${name} as a
                    where input_symbol = a._symbol
                        and input_price = a._price_str
                        and input_sequence::bigint > a._sequence
                ) then
                    if (input_amount = '0') then
                        delete from ${name} as a
                        where a._price_str = input_price and a._symbol = input_symbol;
                    else
                        update ${name}
                        set
                            _amount = input_amount::float,
                            _amount_str = input_amount,
                            _sequence = input_sequence::bigint
                        where _price_str = input_price and _symbol = input_symbol;
                    end if;
                elseif (
                    not exists (select true
                    from ${name} as a
                        where input_symbol = a._symbol
                            and input_price = a._price_str)
                ) then
                    insert into ${name}(_symbol, _price, _amount, _sequence, _price_str, _amount_str)
                    values(input_symbol, input_price::float, input_amount::float, input_sequence::bigint, input_price, input_amount);
                end if;
                
                --sql in any scenario (delete, update, insert or none) we return top best
                return query 
                    select '${name === 'asks' ? 'ask' : 'bid'}'::varchar(5) as type, a._symbol, a._price_str as price, a._amount_str as amount
                    from ${name} as a
                    order by a._price ${name === 'asks' ? '' : 'desc'}
                    limit input_best_limit;
            end;
        $FUNCTION$;
    `;
}

async function main() {
    const pool = await pre();

    await pool.query(createTableQuery('asks'));
    await pool.query(addInexSymbolPriceQuery('asks'));
    await pool.query(gepsertFnQuery('asks'));

    await pool.query(createTableQuery('bids'));
    await pool.query(addInexSymbolPriceQuery('bids'));
    const res = await pool.query(gepsertFnQuery('bids'));

    console.log(res);

    await pool.end();
}

(async () => {
    try {
        main();
    } catch (error) {
        console.error('=== ERROR ===');
        console.error(error);
        console.error('=============');
    }
})();
