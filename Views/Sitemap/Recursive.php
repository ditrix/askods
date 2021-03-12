<?php if(isset($result[$cur]) AND count($result[$cur])): ?>
    <ul>
        <?php foreach($result[$cur] AS $obj): ?>
            <li><a href="<?php echo Core\HTML::link($add.'/'.$obj->alias); ?>"><?php echo $obj->name; ?></a>
                <?php echo Core\View::tpl(array('result' => $result, 'cur' => $obj->id, 'add' => $add), 'Sitemap/Recursive'); ?>
            </li>
        <?php endforeach; ?>
    </ul>
<?php endif; ?>