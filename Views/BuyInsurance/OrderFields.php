<table>
    <tbody>
        <?php foreach($result as $row): ?>
            <tr>
                <td><?php echo $row['name']; ?></td>
                <td><?php echo $row['value']; ?></td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>