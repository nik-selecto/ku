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

async function main() {
    const pool = await pre();

    await pool.query(`--sql
        create table asks (
            _symbol varchar(16),
            _price float,
            _amount float,
            _sequence bigint,
            _price_str varchar(20),
            _amount_str varchar(20),
            _id serial primary key
        );
    `);

    const res = await pool.query(`--sql
        create function gepsert(
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
                    from asks as a
                    where input_symbol = a._symbol
                        and input_price = a._price_str
                        and input_sequence::bigint > a._sequence
                ) then
                    if (input_amount = '0') then
                        delete from asks as a
                        where a._price_str = input_price and a._symbol = input_symbol;
                    else
                        update asks
                        set
                            _amount = input_amount::float,
                            _amount_str = input_amount,
                            _sequence = input_sequence::bigint
                        where _price_str = input_price and _symbol = input_symbol;
                    end if;
                elseif (
                    not exists (select true
                    from asks as a
                        where input_symbol = a._symbol
                            and input_price = a._price_str)
                ) then
                    insert into asks(_symbol, _price, _amount, _sequence, _price_str, _amount_str)
                    values(input_symbol, input_price::float, input_amount::float, input_sequence::bigint, input_price, input_amount);
                end if;
                
                --sql in any scenario (delete, update, insert or none) we return top best
                return query 
                    select 'ask'::varchar(5) as type, a._symbol, a._price_str as price, a._amount_str as amount
                    from asks as a
                    order by a._price
                    limit input_best_limit;
            end;
        $FUNCTION$;
    `);

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
