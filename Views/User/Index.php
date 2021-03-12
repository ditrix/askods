<div class="myInformation">
    <div class="infoTitle">Ваше имя</div>
    <div class="infoValue">
        <?php if ($user->name): ?>
            <?php echo $user->name; ?>
        <?php else: ?>
            <a href="<?php echo Core\HTML::link('account/profile'); ?>">Не указано</a>
        <?php endif ?>
    </div>
</div>
<div class="myInformation">
    <div class="infoTitle">Электронная почтa</div>
    <div class="infoValue">
        <?php if ($user->email): ?>
            <?php echo $user->email; ?>
        <?php else: ?>
            <a href="<?php echo Core\HTML::link('account/profile'); ?>">Не указано</a>
        <?php endif ?>
    </div>
</div>
<div class="myInformation">
    <div class="infoTitle">Телефон</div>
    <div class="infoValue">
        <?php if ($user->phone): ?>
            <?php echo $user->phone; ?>
        <?php else: ?>
            <a href="<?php echo Core\HTML::link('account/profile'); ?>">Не указано</a>
        <?php endif ?>
    </div>
</div>
<div class="lkLinks">
    <div class="lkLink"><a href="<?php echo Core\HTML::link('account/profile'); ?>">Редактировать личные данные</a></div>
    <div class="lkLink"><a href="<?php echo Core\HTML::link('account/change_password'); ?>">Изменить пароль</a></div>
</div>

<div class="socEnter" style="padding: 3% 0;">
    <p>Ваши соц. сети</p>
    <div class="socLinkEnter">
        <?php $arr = array(); ?>
        <?php foreach($socials AS $key => $value): ?>
            <?php if($value): ?>
                <button class="<?php echo $key; ?> deleteConnection" title="<?php echo $value->first_name.' '.$value->last_name; ?>" data-id="<?php echo $value->id; ?>"></button>
            <?php else: ?>
                <?php $arr[] = $key; ?>
            <?php endif; ?>
        <?php endforeach; ?>
    </div>
    <div class="clear"></div>
</div>
<?php if(count($arr)): ?>
    <div class="socEnter" style="padding: 3% 0;">
        <p>Добавить соц. сеть</p>
        <div class="socLinkEnter">
            <div id="uLogin" data-ulogin="display=small;fields=first_name,last_name,email;providers=<?php echo implode(',', $arr); ?>;hidden=;redirect_uri=http%3A%2F%2F<?php echo $_SERVER['HTTP_HOST']; ?>%2Faccount%2Fadd-social-network"></div>
        </div>
        <div class="clear"></div>
    </div>
<?php endif; ?>