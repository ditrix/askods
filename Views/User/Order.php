<div class="wTxt" style="position: relative;">
    <a href="<?php echo \Core\HTML::link('account/print/'.$obj->id); ?>" target="_blank" class="userOrderPrint">Распечатать</a>
    <div class="userOrderInfoBlock">
        <div class="userOrderTitle">Статус</div>
        <div class="userOrderValue"><?php echo $statuses[$obj->status]; ?></div>
    </div>
    <div class="userOrderInfoBlock">
        <div class="userOrderTitle">Итоговая сумма</div>
        <div class="userOrderValue"><?php echo (int) $obj->amount; ?> грн.</div>
    </div>
    <div class="userOrderInfoBlock">
        <div class="userOrderTitle">Способ оплаты</div>
        <div class="userOrderValue">
            <?php echo $payment[ $obj->payment ]; ?>
        </div>
    </div>
    <div class="userOrderInfoBlock">
        <div class="userOrderTitle">Доставка</div>
        <div class="userOrderValue">
            <?php echo $delivery[ $obj->delivery ] . ($obj->delivery == 2 ? ', '.$obj->number : ''); ?>
        </div>
    </div>
    <div class="userOrderInfoBlock">
        <div class="userOrderTitle">Адресат</div>
        <div class="userOrderValue">
            <?php echo $obj->name; ?>
        </div>
    </div>
    <div class="userOrderInfoBlock">
        <div class="userOrderTitle">Телефон</div>
        <div class="userOrderValue">
            <?php echo $obj->phone; ?>
        </div>
    </div>

    <div class="history wTxt onlyOneOrder">
        <table class="table-zebra myStyles">
            <tr>
                <th>Фото</th>
                <th>Товар</th>
                <th>Цена</th>
                <th>Количество</th>
                <th>Итог</th>
            </tr>
            <?php foreach ($cart as $item): ?>
                <tr>
                    <td>
                        <?php if(is_file(HOST.Core\HTML::media('images/catalog/small/'.$item->image))): ?>
                            <a href="<?php echo \Core\HTML::link($item->alias.'/p'.$item->id); ?>" target="_blank">
                                <img src="<?php echo Core\HTML::media('images/catalog/small/'.$item->image); ?>" />
                            </a>
                        <?php endif; ?>
                    </td>
                    <td class="userOrderNotCenterTD">
                        <?php if ($item->id): ?>
                            <a href="<?php echo \Core\HTML::link($item->alias.'/p'.$item->id); ?>" target="_blank">
                                <?php echo $item->name; ?>
                            </a>
                        <?php else: ?>
                            <i>( Удален )</i>
                        <?php endif ?>
                    </td>
                    <td>
                        <?php echo (int) $item->price; ?> грн
                    </td>
                    <td>
                        <?php echo (int) $item->count; ?> шт
                    </td>
                    <td>
                        <?php echo (int) $item->count * (int) $item->price; ?> грн
                    </td>
                </tr>
            <?php endforeach; ?>
        </table>
    </div>
</div>