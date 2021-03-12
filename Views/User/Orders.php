<?php if (!count($orders)): ?>
    <p>У Вас еще нет заказов!</p>
<?php else: ?>
    <div class="history wTxt">
        <table class="table-zebra myStyles">
            <tr>
                <th></th>
                <th>Дата</th>
                <th>Адресат</th>
                <th>Сумма заказа</th>
                <th>Статус</th>
                <th></th>
            </tr>
            <?php foreach ($orders AS $obj): ?>
                <tr>
                    <td><a href="<?php echo Core\HTML::link('account/orders/'.$obj->id); ?>">№ <?php echo $obj->id ?></a></td>
                    <td><?php echo date('d.m.Y', $obj->created_at); ?></td>
                    <td><?php echo $obj->name; ?></td>
                    <td><?php echo $obj->amount; ?> <span>грн</span></td>
                    <td><?php echo $statuses[ $obj->status ]; ?></td>
                    <td><a href="<?php echo Core\HTML::link('account/print/'.$obj->id); ?>" target="_blank">Печать</a></td>
                </tr>
            <?php endforeach ?>
        </table>
    </div>
<?php endif ?>