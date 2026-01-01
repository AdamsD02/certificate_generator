<?php
session_start();

require_once __DIR__ . '/../config/db_config.php';

// common json response handler
function return_json($status, $msg, $data = null)
{
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status,
        'message' => $msg,
        'data' => $data
    ]);
    exit();
}

try {
    if (isset($_POST['action'])) {
        $action = $_POST['action'];
        switch ($action) {
            case 'create':
                # Save template in DB
                if (
                    empty($_POST['t_name']) ||
                    empty($_POST['orientation']) ||
                    empty($_POST['html_code'])
                ) {
                    return_json('error', 'Required field missing.');
                }
                save_template($conn);
                break;

            case 'edit':
                # Update template in DB

                if (empty($_POST['id'])) {
                    return_json('error', 'Template not passed.');
                }
                if (empty($_POST['tname']) || empty($_POST['orientation']) || empty($_POST['html_code'])) {
                    return_json('error', 'Required fields missing.');
                }

                update_template($conn);
                break;

            case 'delete':
                # Delete template from DB
                if (!isset($_POST['id'])) {
                    return_json('error', 'Template not passed.');
                }

                delete_template($conn);
                break;

            case 'list':
                # List templates onto Dashboard
                list_templates($conn);
                break;

            case 'use':
                # sets the Template-ID into Session

                if (isset($_POST['id'])) {
                    $_SESSION['use_id'] = $_POST['id'];

                    return_json('success', 'Template ready.');
                }

                return_json('error', 'Template not passed.');

                break;

            case 'unuse':
                # resets the Template-ID in Session

                if (isset($_SESSION['use_id'])) {
                    unset($_SESSION['use_id']);
                    return_json('success', 'Template id reset.');
                }

                return_json('error', 'Template id not reset.');
                break;

            case 'id_selected':
                # Returns data of Template-ID in Session 
                if (isset($_SESSION['use_id'])) {
                    get_template($conn);
                }

                return_json('error', 'Template not passed.');

                break;

            default:
                return_json('error', 'Invalid action.');

                break;
        }
    }
} catch (\Throwable $th) {
    //throw $th;
    return_json('error', 'Error thrown by Server.' . $th->getMessage());
}

function save_template($conn)
{

    $tname       = $_POST['t_name'];
    $orientation = $_POST['orientation'];
    $html_code   = $_POST['html_code'];
    $opacity     = $_POST['opacity'] ?? '';
    $desc        = $_POST['des'] ?? '';
    // $tags         = $_POST['tags'] ?? '';
    $u_id        = $_SESSION['uid'];

    // Upload bg image if exists
    $bg_img = "";
    if (!empty($_FILES['bg_img']['name'])) {
        $fileName = time() . "_" . basename($_FILES["bg_img"]["name"]);
        $target = "./../../uploads/background/" . $fileName;

        if (!move_uploaded_file($_FILES["bg_img"]["tmp_name"], $target)) {
            return_json("error", "Failed to upload background image.");
        }

        $bg_img = $fileName;
    }

    $query = "INSERT INTO templates (t_name, orientation, html_code, bg_img, opacity, description, u_id)
              VALUES (?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($query);
    $stmt->bind_param(
        'sssssssi',
        $tname,
        $orientation,
        $html_code,
        $bg_img,
        $opacity,
        $desc,
        // $tags,
        $u_id
    );

    if ($stmt->execute()) {
        return_json('success', 'Template saved successfully.');
    }

    return_json('error', 'Failed to save template.');
}

function get_template($conn)
{
    $id = $_SESSION['use_id'];

    $query = 'SELECT * FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$row = $result->fetch_assoc()) {
        return_json('error', 'No Template Data available.');
    }

    $data = [
        't_id' => $id,
        'tname' => $row['t_name'],
        'orientation' => $row['orientation'],
        'html_code' => $row['html_code'],
        'bg_img' => $row['bg_img'] ?? '',
        'opacity' => $row['opacity'] ?? '',
        'desc' => $row['description'] ?? '',
        // 'tags' => $row['tags'] ?? ''
    ];
    return_json('success', 'Retrieved Template Successfuly.', $data);
}

function delete_template($conn)
{

    $id = $_POST['id'];

    // First check if template exists
    $checkQuery = 'SELECT t_id FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if (!$result->fetch_assoc()) {
        return_json('error', 'Template does not exist.');
    }

    // Delete query
    $deleteQuery = 'DELETE FROM templates WHERE t_id = ?';
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bind_param('i', $id);

    if ($stmt->execute()) {
        return_json('success', 'Template deleted successfully.');
    } else {
        return_json('error', 'Failed to delete template.');
    }
}


function update_template($conn)
{

    if (!isset($_SESSION['id'])) {
        return_json('error', 'Template ID missing.');
    }

    $id = $_SESSION['id'];

    // Fetch existing template first
    $get = $conn->prepare("SELECT bg_img FROM templates WHERE t_id=?");
    $get->bind_param("i", $id);
    $get->execute();
    $old = $get->get_result()->fetch_assoc();
    $existing_bg = $old['bg_img'];

    // Posted fields
    $tname       = $_POST['t_name'];
    $orientation = $_POST['orientation'];
    $html_code   = $_POST['html_code'];
    $opacity     = $_POST['opacity'] ?? '';
    $desc        = $_POST['des'] ?? '';
    // $tags         = $_POST['tags'] ?? '';

    // ---------- Handle bg_img ----------
    if (!empty($_FILES['bg_img']['name'])) {
        // New image uploaded
        $fileName = time() . "_" . basename($_FILES["bg_img"]["name"]);
        $target = "./../../uploads/background/" . $fileName;

        if (!move_uploaded_file($_FILES["bg_img"]["tmp_name"], $target)) {
            return_json("error", "Failed to upload background image.");
        }

        $bg_img = $fileName;
    } else {
        // User did NOT upload a new file → keep old one
        $bg_img = $existing_bg;
    }

    // ---------- Perform update ----------
    $query = "UPDATE templates 
              SET t_name=?, orientation=?, html_code=?, bg_img=?, opacity=?, description=?
              WHERE t_id=?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param(
        'ssssssi',
        $tname,
        $orientation,
        $html_code,
        $bg_img,
        $opacity,
        $desc,
        // $tags,
        $id
    );

    if ($stmt->execute()) {
        return_json('success', 'Template updated successfully.');
    }

    return_json('error', 'Failed to update template.');
}

function list_templates($conn)
{

    $query = "SELECT t_id, t_name, orientation, bg_img, opacity FROM templates";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if no records found
    if ($result->num_rows === 0) {
        return_json('error', 'No templates found.');
    }

    // Fetch all templates
    $templates = [];
    while ($row = $result->fetch_assoc()) {
        $templates[] = $row;
    }
    return_json('success', 'Templates retrieved successfully.', $templates);
}
