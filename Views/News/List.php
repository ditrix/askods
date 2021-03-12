<div class="wBlock list_news">
    <div class="wSize">
        <div class="wTitle w_tal">
            <h1><?php echo $current->h1 ? $current->h1 : $current->name ?></h1>
        </div>
        <?php if (count($result) == 0): ?>
            <p>Новости отсутствуют!</p>
        <?php else: ?>
            <?php echo \Core\View::tpl(['result' => $result], 'News/ListJustNews'); ?>
            <?php echo $pager; ?>
        <?php endif; ?>
    </div>
</div>
