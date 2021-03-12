<div form="true" class="wForm regBlock lkForm" methos="post" action="" data-ajax="change_password">
    <div class="wFormRow">
        <input data-name="old_password" type="password" minlength="4" placeholder="Старый пароль" name="old_password" data-rule-required="true">
        <label>Старый пароль</label>
    </div>
    <div class="wFormRow">
        <input data-name="password" type="password" minlength="4" id="password" placeholder="Новый пароль" name="password" data-rule-required="true">
        <label>Новый пароль</label>
    </div> 
    <div class="wFormRow">
        <input data-name="confirm" type="password" minlength="4" placeholder="Подтвердите пароль" name="confirm" data-rule-required="true">
        <label>Повторите новый пароль</label>
    </div>
    <?php if(array_key_exists('token', $_SESSION)): ?>
        <input type="hidden" data-name="token" value="<?php echo $_SESSION['token']; ?>" />
    <?php endif; ?>
    <div class="tar">
        <button class="wSubmit enterReg_btn">подтвердить</button>
    </div>
</div>