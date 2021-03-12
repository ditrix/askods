<div form="true" class="wForm regBlock lkForm" methos="post" action="" data-ajax="edit_profile">
    <div class="wFormRow">
        <input data-name="name" type="text" name="name" data-rule-bykvu="true" placeholder="ФИО" value="<?php echo $user->name; ?>" required>
        <label>ФИО</label>
    </div>
    <div class="wFormRow">
        <input data-name="email" type="text" name="email" data-rule-email="true" placeholder="E-mail" value="<?php echo $user->email ?>" required>
        <label>E-mail</label>
    </div> 
    <div class="wFormRow">
        <input data-name="phone" type="tel" class="tel" value="<?php echo $user->phone; ?>" name="phone" data-rule-phoneUA="true" maxlength="19" minlength="19" placeholder="Телефон" data-rule-required="true">
        <label>Телефон</label>
    </div>
    <?php if(array_key_exists('token', $_SESSION)): ?>
        <input type="hidden" data-name="token" value="<?php echo $_SESSION['token']; ?>" />
    <?php endif; ?>
    <div class="tar">
        <button class="wSubmit enterReg_btn">подтвердить</button>
    </div>
</div>