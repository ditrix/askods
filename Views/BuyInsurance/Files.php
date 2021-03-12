<div class="wBlock_service__right--list_files">
    <ul>
        <?php foreach($files as $file): ?>
            <li>
                <span class="svgHolder"><svg><use xlink:href="#icon_pdf"/></svg></span>
                <span class="title">
                    <a href="/<?php echo $directory . '/' . $file->file; ?>" target="_blank"
                    ><?php echo $file->name; ?></a>
                    <span>(<?php echo mb_strtolower($file->extension); ?>, <?php echo $file->size; ?>)</span>
                </span>
            </li>
        <?php endforeach; ?>
    </ul>
</div>